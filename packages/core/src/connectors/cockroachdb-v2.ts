// @ts-nocheck
// CockroachDB v2 Connector — Pulsyn CDC Platform
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('cockroachdb-v2')
export class CockroachdbV2Connector extends BaseConnector {
  private pool: any = null;
  private client: any = null;
  private db: any = null;
  private apiKey: string = '';
  private baseUrl: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'cockroachdb-v2', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    const { Pool } = require('pg'); this.pool = new Pool({ host: config.host, port: config.port || 5432, database: config.database, user: config.user, password: config.password, ssl: config.ssl ? { rejectUnauthorized: false } : undefined }); await this.pool.query('SELECT 1');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.pool) await this.pool.end?.();
    if (this.client) await this.client.shutdown?.();
    if (this.db) this.db.close?.();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1'); return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const res = await this.pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"); return res.rows.map(r => r.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const cols = await this.pool.query('SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1', [table]); return { name: table, columns: cols.rows.map(c => ({ name: c.column_name, type: c.data_type, nullable: c.is_nullable === 'YES' })), primaryKey: [] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await this.pool.query('SELECT * FROM "' + table + '" LIMIT $1', [this.batchSize]); return res.rows.map(row => createEvent({ op: 'S', table, data: row, watermark: row.id || '' }));
  }

  async startCDC(): Promise<void> { throw new Error('CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}
