// @ts-nocheck
import { Pool, PoolClient } from 'pg';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('redshift')
export class RedshiftConnector extends BaseConnector {
  private pool: Pool | null = null;
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      this.pool = new Pool({
        host: config.host,
        port: config.port || 5439,
        database: config.database,
        user: config.username,
        password: config.password,
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
      await this.pool.query('SELECT 1');
      this.connected = true;
    } catch (error) {
      throw new Error(`Redshift connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.stopCDC();
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
      }
      this.connected = false;
    } catch (error) {
      throw new Error(`Redshift disconnect failed: ${(error as Error).message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const result = await this.pool.query('SELECT 1 AS ok');
      return result.rows[0]?.ok === 1;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.pool) throw new Error('Not connected');
    const result = await this.pool.query(
      `SELECT schemaname || '.' || tablename AS full_name
       FROM pg_tables
       WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_internal')
       ORDER BY full_name`
    );
    return result.rows.map((r) => r.full_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.pool) throw new Error('Not connected');
    const [schema, tableName] = table.includes('.') ? table.split('.') : ['public', table];
    const cols = await this.pool.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2
       ORDER BY ordinal_position`,
      [schema, tableName]
    );
    const pks = await this.pool.query(
      `SELECT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
       WHERE tc.table_schema = $1 AND tc.table_name = $2
         AND tc.constraint_type = 'PRIMARY KEY'`,
      [schema, tableName]
    );
    return {
      table,
      columns: cols.rows.map((c) => ({
        name: c.column_name, type: c.data_type,
        nullable: c.is_nullable === 'YES', defaultValue: c.column_default,
      })),
      primaryKeys: pks.rows.map((r) => r.column_name),
    };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.pool) throw new Error('Not connected');
    // Redshift has no native CDC — use watermark polling
    this.cdcActive = true;
    this.pollWatermark(callback);
  }

  private async pollWatermark(cb: (event: CDCEvent) => void): Promise<void> {
    const wmCol = this.config.watermarkColumn || 'updated_at';
    let lastWatermark: string | null = null;

    while (this.cdcActive && this.pool) {
      try {
        const tables = await this.getTables();
        for (const table of tables) {
          const query = lastWatermark
            ? `SELECT * FROM ${table} WHERE ${wmCol} > $1 ORDER BY ${wmCol} LIMIT $2`
            : `SELECT * FROM ${table} ORDER BY ${wmCol} DESC LIMIT $1`;
          const params = lastWatermark ? [lastWatermark, this.batchSize] : [this.batchSize];
          const result = await this.pool!.query(query, params);
          for (const row of result.rows) {
            cb({ op: 'I', table, before: null, after: row, ts: new Date() });
            if (row[wmCol]) lastWatermark = row[wmCol].toString();
          }
        }
        await new Promise((r) => setTimeout(r, 10000));
      } catch {
        if (this.cdcActive) await new Promise((r) => setTimeout(r, 30000));
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
      const query = lastKey
        ? `SELECT * FROM ${table} WHERE ${pk} > $1 ORDER BY ${pk} LIMIT $2`
        : `SELECT * FROM ${table} ORDER BY ${pk} LIMIT $1`;
      const params = lastKey ? [lastKey, this.batchSize] : [this.batchSize];
      const result = await this.pool.query(query, params);
      if (result.rows.length === 0) break;
      for (const row of result.rows) {
        events.push(createEvent('S', table, row, null, row[pk]?.toString() || null, { source: 'redshift' }));
      }
      lastKey = result.rows[result.rows.length - 1][pk];
      if (result.rows.length < this.batchSize) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const wmCol = this.config.watermarkColumn || 'updated_at';
    const events: UnifiedChangeEvent[] = [];
    const query = watermark
      ? `SELECT * FROM ${table} WHERE ${wmCol} > $1 ORDER BY ${wmCol} LIMIT $2`
      : `SELECT * FROM ${table} ORDER BY ${wmCol} LIMIT $1`;
    const params = watermark ? [watermark, this.batchSize] : [this.batchSize];
    const result = await this.pool.query(query, params);
    for (const row of result.rows) {
      events.push(createEvent('I', table, row, null, row[wmCol]?.toString() || null, { source: 'redshift' }));
    }
    return events;
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.pool) throw new Error('Not connected');
    const result = await this.pool.query(
      `SELECT "rows" AS cnt FROM svv_table_info WHERE "table" = $1`,
      [table.split('.').pop()]
    );
    return Number(result.rows[0]?.cnt || 0);
  }

  async getPrimaryKey(table: string): Promise<string> {
    const schema = await this.getTableSchema(table);
    return schema.primaryKeys[0] || 'id';
  }
}

