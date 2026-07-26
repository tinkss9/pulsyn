// @ts-nocheck
// Apache CouchDB Connector — Pulsyn CDC Platform
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('couchdb')
export class CouchdbConnector extends BaseConnector {
  private pool: any = null;
  private client: any = null;
  private db: any = null;
  private apiKey: string = '';
  private baseUrl: string = '';
  private connectionString: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'couchdb', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiKey = config.password; this.baseUrl = config.host ? 'https://' + config.host : '';
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.pool) await this.pool.end();
    if (this.client) await this.client.shutdown?.();
    if (this.db) this.db.close?.();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(this.baseUrl + '/health', { headers: { Authorization: 'Bearer ' + this.apiKey } }); return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['default'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'data', type: 'object', nullable: true }], primaryKey: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(this.baseUrl + '/api/' + table + '?limit=' + this.batchSize, { headers: { Authorization: 'Bearer ' + this.apiKey } }); const data = await res.json(); return (data.results || data || []).map(item => createEvent({ op: 'S', table, data: item, watermark: item.id || '' }));
  }

  async startCDC(): Promise<void> { throw new Error('CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}
