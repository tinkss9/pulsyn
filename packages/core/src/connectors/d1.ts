// @ts-nocheck
// Cloudflare D1 Connector — Pulsyn CDC Platform
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('d1')
export class D1Connector extends BaseConnector {
  private pool: any = null;
  private client: any = null;
  private db: any = null;
  private apiKey: string = '';
  private baseUrl: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'd1', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    const Database = require('better-sqlite3'); this.db = new Database(config.database || ':memory:');
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
      this.db.prepare('SELECT 1').get(); return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const rows = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all(); return rows.map(r => r.name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const cols = this.db.prepare('PRAGMA table_info(' + table + ')').all(); return { name: table, columns: cols.map(c => ({ name: c.name, type: c.type, nullable: !c.notnull })), primaryKey: cols.filter(c => c.pk).map(c => c.name) };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const rows = this.db.prepare('SELECT * FROM ' + table + ' LIMIT ' + this.batchSize).all(); return rows.map(row => createEvent({ op: 'S', table, data: row, watermark: row.id || '' }));
  }

  async startCDC(): Promise<void> { throw new Error('CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}
