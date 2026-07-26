// CockroachDB Connector — distributed SQL database source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

import { Pool } from 'pg';

@registerSource('cockroachdb')
export class CockroachDBConnector extends BaseConnector {
  private pool: Pool | null = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'cockroachdb', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.pool = new Pool({
      host: config.host, port: config.port || 26257, database: config.database,
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
    const result = await this.pool!.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
    return result.rows.map((r: any) => r.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const cols = await this.pool!.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`, [table]);
    const pks = await this.pool!.query(`SELECT column_name FROM information_schema.key_column_usage WHERE table_name = $1 AND constraint_name LIKE '%pkey%'`, [table]);
    return {
      name: table,
      columns: cols.rows.map((c: any) => ({ name: c.column_name, type: c.data_type, nullable: c.is_nullable === 'YES' })),
      primaryKey: pks.rows.map((r: any) => r.column_name),
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const result = await this.pool!.query(`SELECT * FROM "${table}" LIMIT $1`, [this.batchSize]);
    return result.rows.map((row: any) => createEvent({ op: 'S', table, after: row, watermark: row.id || '' }));
  }

  async startCDC(): Promise<void> { throw new Error('CockroachDB CDC uses changefeeds — not yet implemented'); }
  async stopCDC(): Promise<void> {}
}


