// WordPress Connector — CMS source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('wordpress')
export class WordPressConnector extends BaseConnector {
  private baseUrl: string = '';
  private token: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'wordpress', config); this.baseUrl = `https://${config.host}/wp-json/wp/v2`; }
  async connect(config: DatabaseConfig): Promise<void> { this.token = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch(`${this.baseUrl}/posts?per_page=1`, { headers: { Authorization: `Bearer ${this.token}` } }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['posts', 'pages', 'users', 'categories']; }
  async getTableSchema(table: string): Promise<TableSchema> { return { name: table, columns: [{ name: 'id', type: 'number', nullable: false }, { name: 'title', type: 'object', nullable: true }, { name: 'date', type: 'datetime', nullable: true }], primaryKey: ['id'] }; }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const r = await fetch(`${this.baseUrl}/${table}?per_page=100`, { headers: { Authorization: `Bearer ${this.token}` } });
    const d = await r.json() as any;
    return (d || []).map((i: any) => createEvent({ op: 'S', table, after: i, watermark: String(i.id) }));
  }
  async startCDC(): Promise<void> { throw new Error('WordPress CDC requires webhooks'); }
  async stopCDC(): Promise<void> {}
}
