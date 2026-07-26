// Squarespace Connector — website builder source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('squarespace')
export class SquarespaceConnector extends BaseConnector {
  private token: string = '';
  private siteId: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'squarespace', config); this.siteId = (config as any).siteId || ''; }
  async connect(config: DatabaseConfig): Promise<void> { this.token = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch(`https://api.squarespace.com/1.0/commerce/orders?limit=1`, { headers: { Authorization: `Bearer ${this.token}` } }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['orders', 'products', 'inventory']; }
  async getTableSchema(table: string): Promise<TableSchema> { return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'status', type: 'string', nullable: true }, { name: 'createdAt', type: 'datetime', nullable: true }], primaryKey: ['id'] }; }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const r = await fetch(`https://api.squarespace.com/1.0/commerce/${table}?limit=100`, { headers: { Authorization: `Bearer ${this.token}` } });
    const d = await r.json() as any;
    return (d.result || []).map((i: any) => createEvent({ op: 'S', table, after: i, watermark: i.id }));
  }
  async startCDC(): Promise<void> { throw new Error('Squarespace CDC requires webhooks'); }
  async stopCDC(): Promise<void> {}
}


