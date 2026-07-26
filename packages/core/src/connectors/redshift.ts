// Redshift Connector — Amazon Redshift data warehouse (PostgreSQL-compatible)
// Uses pg driver with Redshift-specific connection

import { Pool } from 'pg';
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('redshift')
export class RedshiftConnector extends BaseConnector {
  private pool: Pool | null = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'redshift', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.pool = new Pool({
      host: config.host, port: config.port || 5439, database: config.database,
      user: config.user, password: config.password, ssl: { rejectUnauthorized: false }, max: 10,
    });
    const client = await this.pool.connect();
    await client.query('SELECT 1');
    client.release();
    this.connected = true;
  }

  async disconnect(): Promise<void> { if (this.pool) { await this.pool.end(); this.pool = null; } this.connected = false; }
  async testConnection(): Promise<boolean> { try { const c = await this.pool!.connect(); await c.query('SELECT 1'); c.release(); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    const result = await this.pool!.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`);
    return result.rows.map(r => r.tablename);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const cols = await this.pool!.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`, [table]);
    return {
      name: table,
      columns: cols.rows.map(r => ({ name: r.column_name, type: r.data_type, nullable: r.is_nullable === 'YES' })),
      primaryKey: [], // Redshift doesn't enforce PKs
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const result = await this.pool!.query(`SELECT * FROM "${table}" LIMIT $1`, [this.batchSize]);
    return result.rows.map(row => createEvent({ op: 'S', table, after: row }));
  }

  async startCDC(): Promise<void> { throw new Error('Redshift CDC not supported — use full/incremental extraction'); }
  async stopCDC(): Promise<void> {}

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    let written = 0;
    for (const event of events) {
      if (event.op === 'I' || event.op === 'S') {
        const cols = Object.keys(event.after || {});
        const vals = cols.map((_, i) => `$${i + 1}`);
        await this.pool!.query(`INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(',')}) VALUES (${vals.join(',')})`, Object.values(event.after || {}));
        written++;
      }
    }
    return written;
  }
}
