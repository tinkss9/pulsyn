// @ts-nocheck
import oracledb from 'oracledb';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('oracle')
export class OracleConnector extends BaseConnector {
  private pool: oracledb.Pool | null = null;
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
      this.pool = await oracledb.createPool({
        user: config.username,
        password: config.password,
        connectString: `${config.host}:${config.port || 1521}/${config.database}`,
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 2,
      });
      const conn = await this.pool.getConnection();
      await conn.execute('SELECT 1 FROM DUAL');
      await conn.close();
      this.connected = true;
    } catch (error) {
      throw new Error(`Oracle connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.stopCDC();
      if (this.pool) {
        await this.pool.close(0);
        this.pool = null;
      }
      this.connected = false;
    } catch (error) {
      throw new Error(`Oracle disconnect failed: ${(error as Error).message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const conn = await this.pool.getConnection();
      await conn.execute('SELECT 1 FROM DUAL');
      await conn.close();
      return true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.pool) throw new Error('Not connected');
    try {
      const conn = await this.pool.getConnection();
      const result = await conn.execute(
        `SELECT owner || '.' || table_name AS full_name FROM all_tables
         WHERE owner NOT IN ('SYS','SYSTEM','DBSNMP','OUTLN') ORDER BY full_name`
      );
      await conn.close();
      return (result.rows as any[]).map((r) => r.FULL_NAME);
    } catch (error) {
      throw new Error(`Failed to list tables: ${(error as Error).message}`);
    }
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.pool) throw new Error('Not connected');
    try {
      const [owner, tbl] = table.includes('.')
        ? table.split('.') : [this.config.username?.toUpperCase(), table];
      const conn = await this.pool.getConnection();
      const cols = await conn.execute(
        `SELECT column_name, data_type, nullable, data_default
         FROM all_tab_columns WHERE owner = :o AND table_name = :t ORDER BY column_id`,
        { o: owner, t: tbl }
      );
      const pks = await conn.execute(
        `SELECT cols.column_name FROM all_constraints cons
         JOIN all_cons_columns cols ON cons.constraint_name = cols.constraint_name
           AND cons.owner = cols.owner
         WHERE cons.owner = :o AND cons.table_name = :t
           AND cons.constraint_type = 'P' ORDER BY cols.position`,
        { o: owner, t: tbl }
      );
      await conn.close();
      return {
        table,
        columns: (cols.rows as any[]).map((c) => ({
          name: c.COLUMN_NAME, type: c.DATA_TYPE,
          nullable: c.NULLABLE === 'Y', defaultValue: c.DATA_DEFAULT,
        })),
        primaryKeys: (pks.rows as any[]).map((r) => r.COLUMN_NAME),
      };
    } catch (error) {
      throw new Error(`Failed to get schema for ${table}: ${(error as Error).message}`);
    }
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.pool) throw new Error('Not connected');
    try {
      this.cdcActive = true;
      const conn = await this.pool.getConnection();
      const scnRes = await conn.execute('SELECT CURRENT_SCN FROM V$DATABASE');
      let lastScn = (scnRes.rows as any[])?.[0]?.CURRENT_SCN?.toString() || '0';
      await conn.close();

      this.cdcTimer = setInterval(async () => {
        if (!this.cdcActive || !this.pool) return;
        try {
          const c = await this.pool!.getConnection();
          await c.execute(
            `BEGIN DBMS_LOGMNR.START_LOGMNR(STARTSCN => :scn,
             OPTIONS => DBMS_LOGMNR.DICT_FROM_ONLINE_CATALOG); END;`, { scn: lastScn }
          );
          const changes = await c.execute(
            `SELECT operation, seg_owner, table_name, scn FROM V$LOGMNR_CONTENTS
             WHERE SCN > :scn AND seg_owner NOT IN ('SYS','SYSTEM')`, { scn: lastScn }
          );
          for (const row of (changes.rows as any[]) || []) {
            const op = row.OPERATION === 'INSERT' ? 'I'
              : row.OPERATION === 'UPDATE' ? 'U' : 'D';
            callback({ op, table: `${row.SEG_OWNER}.${row.TABLE_NAME}`, before: null, after: null, ts: new Date() });
            lastScn = row.SCN?.toString() || lastScn;
          }
          await c.execute('BEGIN DBMS_LOGMNR.END_LOGMNR; END;');
          await c.close();
        } catch { /* LogMiner may not be available */ }
      }, 2000);
    } catch (error) {
      throw new Error(`Failed to start CDC: ${(error as Error).message}`);
    }
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const schema = await this.getTableSchema(table);
    const pk = schema.primaryKeys[0] || 'ROWID';
    const events: UnifiedChangeEvent[] = [];
    let offset = 0;

    while (true) {
      const conn = await this.pool.getConnection();
      const result = await conn.execute(
        `SELECT * FROM (
           SELECT a.*, ROWNUM rnum FROM (SELECT * FROM ${table} ORDER BY ${pk}) a
           WHERE ROWNUM <= :upper
         ) WHERE rnum > :lower`,
        { upper: offset + this.batchSize, lower: offset }
      );
      await conn.close();
      const rows = (result.rows as any[]) || [];
      if (rows.length === 0) break;
      for (const row of rows) {
        const { RNUM, ...data } = row;
        events.push(createEvent('S', table, data, null, data[pk]?.toString() || null, { source: 'oracle' }));
      }
      offset += this.batchSize;
      if (rows.length < this.batchSize) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const wmCol = this.config.watermarkColumn || 'UPDATED_AT';
    const events: UnifiedChangeEvent[] = [];
    const conn = await this.pool.getConnection();
    const q = watermark
      ? `SELECT * FROM ${table} WHERE ${wmCol} > :wm ORDER BY ${wmCol} FETCH FIRST :lim ROWS ONLY`
      : `SELECT * FROM ${table} ORDER BY ${wmCol} FETCH FIRST :lim ROWS ONLY`;
    const p = watermark ? { wm: watermark, lim: this.batchSize } : { lim: this.batchSize };
    const result = await conn.execute(q, p);
    await conn.close();
    for (const row of (result.rows as any[]) || []) {
      events.push(createEvent('I', table, row, null, row[wmCol]?.toString() || null, { source: 'oracle' }));
    }
    return events;
  }
}

