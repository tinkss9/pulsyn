// @ts-nocheck
import snowflake from 'snowflake-sdk';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('snowflake')
export class SnowflakeConnector extends BaseConnector {
  private connection: snowflake.Connection | null = null;
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      this.connection = snowflake.createConnection({
        account: config.host,
        username: config.username,
        password: config.password,
        database: config.database,
        schema: config.schema || 'PUBLIC',
        warehouse: (config as any).warehouse || 'COMPUTE_WH',
        role: (config as any).role || undefined,
        authenticator: (config as any).authenticator || undefined,
      });
      await new Promise<void>((resolve, reject) => {
        this.connection!.connect((err) => {
          if (err) reject(err); else resolve();
        });
      });
      this.connected = true;
    } catch (error) {
      throw new Error(`Snowflake connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.stopCDC();
      if (this.connection) {
        await new Promise<void>((resolve) => {
          this.connection!.destroy((err) => resolve());
        });
        this.connection = null;
      }
      this.connected = false;
    } catch (error) {
      throw new Error(`Snowflake disconnect failed: ${(error as Error).message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.connection) return false;
      const rows = await this.executeQuery('SELECT 1 AS ok');
      return rows[0]?.OK === 1;
    } catch {
      return false;
    }
  }

  private executeQuery(sql: string, binds: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.connection!.execute({
        sqlText: sql,
        binds,
        complete: (err, stmt, rows) => {
          if (err) reject(err); else resolve(rows || []);
        },
      });
    });
  }

  async getTables(): Promise<string[]> {
    if (!this.connection) throw new Error('Not connected');
    const rows = await this.executeQuery(
      `SELECT TABLE_SCHEMA || '.' || TABLE_NAME AS full_name
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA != 'INFORMATION_SCHEMA'
       ORDER BY full_name`
    );
    return rows.map((r) => r.FULL_NAME);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.connection) throw new Error('Not connected');
    const [schema, tableName] = table.includes('.') ? table.split('.') : ['PUBLIC', table];
    const cols = await this.executeQuery(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [schema, tableName]
    );
    const pks = await this.executeQuery(
      `SHOW PRIMARY KEYS IN TABLE ${schema}.${tableName}`
    );
    return {
      table,
      columns: cols.map((c) => ({
        name: c.COLUMN_NAME, type: c.DATA_TYPE,
        nullable: c.IS_NULLABLE === 'YES', defaultValue: c.COLUMN_DEFAULT,
      })),
      primaryKeys: pks.map((r) => r.column_name || r.COLUMN_NAME),
    };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.connection) throw new Error('Not connected');
    this.cdcActive = true;
    this.pollStreams(callback);
  }

  private async pollStreams(cb: (event: CDCEvent) => void): Promise<void> {
    while (this.cdcActive && this.connection) {
      try {
        const streams = await this.executeQuery(`SHOW STREAMS`);
        for (const stream of streams) {
          if (!stream.stale) {
            const changes = await this.executeQuery(
              `SELECT * FROM ${stream.database_name}.${stream.schema_name}.${stream.name}`
            );
            for (const row of changes) {
              const op = row.METADATA$ACTION === 'INSERT' ? 'I'
                : row.METADATA$ACTION === 'DELETE' ? 'D' : 'U';
              const { 'METADATA$ACTION': _a, 'METADATA$ISUPDATE': _u, 'METADATA$ROW_ID': _r, ...data } = row;
              cb({ op, table: stream.table_name, before: op === 'D' ? data : null, after: op !== 'D' ? data : null, ts: new Date() });
            }
          }
        }
        await new Promise((r) => setTimeout(r, 5000));
      } catch {
        if (this.cdcActive) await new Promise((r) => setTimeout(r, 10000));
      }
    }
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.connection) throw new Error('Not connected');
    const schema = await this.getTableSchema(table);
    const pk = schema.primaryKeys[0] || 'ID';
    const events: UnifiedChangeEvent[] = [];
    let lastKey: any = null;

    while (true) {
      const query = lastKey
        ? `SELECT * FROM ${table} WHERE ${pk} > ? ORDER BY ${pk} LIMIT ?`
        : `SELECT * FROM ${table} ORDER BY ${pk} LIMIT ?`;
      const binds = lastKey ? [lastKey, this.batchSize] : [this.batchSize];
      const rows = await this.executeQuery(query, binds);
      if (rows.length === 0) break;
      for (const row of rows) {
        events.push(createEvent('S', table, row, null, row[pk]?.toString() || null, { source: 'snowflake' }));
      }
      lastKey = rows[rows.length - 1][pk];
      if (rows.length < this.batchSize) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.connection) throw new Error('Not connected');
    // Use CHANGES clause for incremental
    const events: UnifiedChangeEvent[] = [];
    try {
      const query = watermark
        ? `SELECT * FROM ${table} CHANGES(INFORMATION => DEFAULT) AT(TIMESTAMP => '${watermark}'::TIMESTAMP_LTZ)`
        : `SELECT * FROM ${table} CHANGES(INFORMATION => DEFAULT) AT(OFFSET => -3600)`;
      const rows = await this.executeQuery(query);
      for (const row of rows) {
        const op = row.METADATA$ACTION === 'INSERT' ? 'I' : row.METADATA$ACTION === 'DELETE' ? 'D' : 'U';
        const { 'METADATA$ACTION': _a, 'METADATA$ISUPDATE': _u, 'METADATA$ROW_ID': _r, ...data } = row;
        events.push(createEvent(op, table, op !== 'D' ? data : null, op === 'D' ? data : null, null, { source: 'snowflake' }));
      }
    } catch {
      // Fallback to watermark column
      const wmCol = this.config.watermarkColumn || 'UPDATED_AT';
      const query = watermark
        ? `SELECT * FROM ${table} WHERE ${wmCol} > ? ORDER BY ${wmCol} LIMIT ?`
        : `SELECT * FROM ${table} ORDER BY ${wmCol} LIMIT ?`;
      const binds = watermark ? [watermark, this.batchSize] : [this.batchSize];
      const rows = await this.executeQuery(query, binds);
      for (const row of rows) {
        events.push(createEvent('I', table, row, null, row[wmCol]?.toString() || null, { source: 'snowflake' }));
      }
    }
    return events;
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.connection) throw new Error('Not connected');
    const rows = await this.executeQuery(`SELECT COUNT(*) AS cnt FROM ${table}`);
    return rows[0]?.CNT || 0;
  }

  async getPrimaryKey(table: string): Promise<string> {
    const schema = await this.getTableSchema(table);
    return schema.primaryKeys[0] || 'ID';
  }
}

