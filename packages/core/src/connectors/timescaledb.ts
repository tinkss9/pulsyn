// @ts-nocheck
// TimescaleDB Connector — time-series PostgreSQL extension source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

import { Pool } from 'pg';

@registerSource('timescaledb')
export class TimescaleDBConnector extends BaseConnector {
  private pool: Pool | null = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'timescaledb', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.pool = new Pool({
      host: config.host, port: config.port || 5432, database: config.database,
      user: config.user, password: config.password, ssl: config.ssl ? { rejectUnauthorized: false } : false,
    });
    const client = await this.pool.connect();
    await client.query('SELECT 1');
    client.release();
    this.connected = true;
  }

  async disconnect(): Promise<void> { if (this.pool) { await this.pool.end(); this.pool = null; } this.connected = false; }
  async testConnection(): Promise<boolean> {
    try { const c = await this.pool!.connect(); await c.query('SELECT 1'); c.release(); return true; } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const result = await this.pool!.query(`SELECT hypertable_name FROM timescaledb_information.hypertables`);
    return result.rows.map((r: any) => r.hypertable_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const cols = await this.pool!.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`, [table]);
    return {
      name: table,
      columns: cols.rows.map((c: any) => ({ name: c.column_name, type: c.data_type, nullable: c.is_nullable === 'YES' })),
      primaryKey: [],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const result = await this.pool!.query(`SELECT * FROM "${table}" ORDER BY time DESC LIMIT $1`, [this.batchSize]);
    return result.rows.map((row: any) => createEvent({ op: 'S', table, after: row, watermark: row.time }));
  }

  async startCDC(): Promise<void> { throw new Error('TimescaleDB CDC uses PostgreSQL logical replication'); }
  async stopCDC(): Promise<void> {}
}



