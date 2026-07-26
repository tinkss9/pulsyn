// @ts-nocheck
import sql, { ConnectionPool, IResult } from 'mssql';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('mssql')
export class MSSQLConnector extends BaseConnector {
  private pool: ConnectionPool | null = null;
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      this.pool = new ConnectionPool({
        server: config.host,
        port: config.port || 1433,
        database: config.database,
        user: config.username,
        password: config.password,
        options: {
          encrypt: config.ssl || false,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
        pool: { max: 10, min: 2, idleTimeoutMillis: 30000 },
      });
      await this.pool.connect();
      this.connected = true;
    } catch (error) {
      throw new Error(`MSSQL connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.stopCDC();
      if (this.pool) {
        await this.pool.close();
        this.pool = null;
      }
      this.connected = false;
    } catch (error) {
      throw new Error(`MSSQL disconnect failed: ${(error as Error).message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const result = await this.pool.request().query('SELECT 1 AS ok');
      return result.recordset[0]?.ok === 1;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.pool) throw new Error('Not connected');
    const result = await this.pool.request().query(
      `SELECT s.name + '.' + t.name AS full_name
       FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
       WHERE t.type = 'U' ORDER BY full_name`
    );
    return result.recordset.map((r) => r.full_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.pool) throw new Error('Not connected');
    const [schema, tableName] = table.includes('.') ? table.split('.') : ['dbo', table];
    const cols = await this.pool.request()
      .input('schema', sql.NVarChar, schema)
      .input('table', sql.NVarChar, tableName)
      .query(
        `SELECT c.COLUMN_NAME, c.DATA_TYPE, c.IS_NULLABLE, c.COLUMN_DEFAULT
         FROM INFORMATION_SCHEMA.COLUMNS c
         WHERE c.TABLE_SCHEMA = @schema AND c.TABLE_NAME = @table
         ORDER BY c.ORDINAL_POSITION`
      );
    const pks = await this.pool.request()
      .input('schema', sql.NVarChar, schema)
      .input('table', sql.NVarChar, tableName)
      .query(
        `SELECT col.COLUMN_NAME
         FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
         JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE col ON tc.CONSTRAINT_NAME = col.CONSTRAINT_NAME
         WHERE tc.TABLE_SCHEMA = @schema AND tc.TABLE_NAME = @table AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'`
      );
    return {
      table,
      columns: cols.recordset.map((c) => ({
        name: c.COLUMN_NAME, type: c.DATA_TYPE,
        nullable: c.IS_NULLABLE === 'YES', defaultValue: c.COLUMN_DEFAULT,
      })),
      primaryKeys: pks.recordset.map((r) => r.COLUMN_NAME),
    };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.pool) throw new Error('Not connected');
    const check = await this.pool.request().query(
      `SELECT is_cdc_enabled FROM sys.databases WHERE name = DB_NAME()`
    );
    if (!check.recordset[0]?.is_cdc_enabled) {
      throw new Error('CDC not enabled. Run sys.sp_cdc_enable_db');
    }
    this.cdcActive = true;
    this.pollCDCChanges(callback);
  }

  private async pollCDCChanges(cb: (event: CDCEvent) => void): Promise<void> {
    let lastLsn: Buffer | null = null;
    while (this.cdcActive && this.pool) {
      try {
        const lsnRes = await this.pool.request().query(`SELECT sys.fn_cdc_get_max_lsn() AS max_lsn`);
        const maxLsn = lsnRes.recordset[0]?.max_lsn;
        if (!maxLsn) { await new Promise((r) => setTimeout(r, 1000)); continue; }

        const fromLsn = lastLsn
          ? (await this.pool.request().input('lsn', sql.VarBinary, lastLsn)
              .query(`SELECT sys.fn_cdc_increment_lsn(@lsn) AS next_lsn`)).recordset[0]?.next_lsn
          : (await this.pool.request().query(`SELECT sys.fn_cdc_get_min_lsn('dbo') AS min_lsn`)).recordset[0]?.min_lsn;

        if (!fromLsn) { await new Promise((r) => setTimeout(r, 1000)); continue; }

        const tables = await this.pool.request().query(
          `SELECT OBJECT_SCHEMA_NAME(source_object_id) + '.' + OBJECT_NAME(source_object_id) AS table_name,
                  capture_instance FROM cdc.change_tables`
        );
        for (const t of tables.recordset) {
          const changes = await this.pool.request()
            .input('from_lsn', sql.VarBinary, fromLsn)
            .input('to_lsn', sql.VarBinary, maxLsn)
            .query(`SELECT * FROM cdc.fn_cdc_get_all_changes_${t.capture_instance}(@from_lsn, @to_lsn, 'all update old')`);
          for (const row of changes.recordset) {
            const op = row.__$operation === 2 ? 'I' : row.__$operation === 4 ? 'U' : 'D';
            const { __$start_lsn, __$seqval, __$operation, __$update_mask, ...data } = row;
            cb({ op, table: t.table_name, before: op === 'U' ? data : null, after: op !== 'D' ? data : null, ts: new Date() });
          }
        }
        lastLsn = maxLsn;
        await new Promise((r) => setTimeout(r, 1000));
      } catch {
        if (this.cdcActive) await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const schema = await this.getTableSchema(table);
    const pk = schema.primaryKeys[0] || 'id';
    const events: UnifiedChangeEvent[] = [];
    let lastKey: any = null;
    while (true) {
      const req = this.pool.request().input('batchSize', sql.Int, this.batchSize);
      let query: string;
      if (lastKey) {
        req.input('lastKey', sql.NVarChar, String(lastKey));
        query = `SELECT TOP (@batchSize) * FROM [${table.replace('.', '].[')}] WHERE [${pk}] > @lastKey ORDER BY [${pk}]`;
      } else {
        query = `SELECT TOP (@batchSize) * FROM [${table.replace('.', '].[')}] ORDER BY [${pk}]`;
      }
      const result = await req.query(query);
      if (result.recordset.length === 0) break;
      for (const row of result.recordset) {
        events.push(createEvent('S', table, row, null, row[pk]?.toString() || null, { source: 'mssql' }));
      }
      lastKey = result.recordset[result.recordset.length - 1][pk];
      if (result.recordset.length < this.batchSize) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const wmCol = this.config.watermarkColumn || 'updated_at';
    const events: UnifiedChangeEvent[] = [];
    const req = this.pool.request().input('batchSize', sql.Int, this.batchSize);
    let query: string;
    if (watermark) {
      req.input('watermark', sql.NVarChar, watermark);
      query = `SELECT TOP (@batchSize) * FROM [${table.replace('.', '].[')}] WHERE [${wmCol}] > @watermark ORDER BY [${wmCol}]`;
    } else {
      query = `SELECT TOP (@batchSize) * FROM [${table.replace('.', '].[')}] ORDER BY [${wmCol}]`;
    }
    const result = await req.query(query);
    for (const row of result.recordset) {
      events.push(createEvent('I', table, row, null, row[wmCol]?.toString() || null, { source: 'mssql' }));
    }
    return events;
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.pool) throw new Error('Not connected');
    const [schema, tableName] = table.includes('.') ? table.split('.') : ['dbo', table];
    const result = await this.pool.request()
      .input('schema', sql.NVarChar, schema)
      .input('table', sql.NVarChar, tableName)
      .query(
        `SELECT SUM(p.rows) AS row_count FROM sys.partitions p
         JOIN sys.tables t ON p.object_id = t.object_id
         JOIN sys.schemas s ON t.schema_id = s.schema_id
         WHERE s.name = @schema AND t.name = @table AND p.index_id IN (0, 1)`
      );
    return result.recordset[0]?.row_count || 0;
  }

  async getPrimaryKey(table: string): Promise<string> {
    const schema = await this.getTableSchema(table);
    return schema.primaryKeys[0] || 'id';
  }
}

