// Vercel Connector — deployments source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('vercel')
export class VercelConnector extends BaseConnector {
  private token: string = '';
  private teamId: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'vercel', config); this.teamId = (config as any).teamId || ''; }
  async connect(config: DatabaseConfig): Promise<void> { this.token = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch('https://api.vercel.com/v2/user', { headers: { Authorization: `Bearer ${this.token}` } }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['deployments', 'projects', 'domains']; }
  async getTableSchema(table: string): Promise<TableSchema> { return { name: table, columns: [{ name: 'uid', type: 'string', nullable: false }, { name: 'name', type: 'string', nullable: true }, { name: 'created', type: 'datetime', nullable: true }], primaryKey: ['uid'] }; }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const r = await fetch(`https://api.vercel.com/v2/${table}?limit=100`, { headers: { Authorization: `Bearer ${this.token}` } });
    const d = await r.json() as any;
    return (d[table] || d.projects || []).map((i: any) => createEvent({ op: 'S', table, after: i, watermark: i.uid || i.id }));
  }
  async startCDC(): Promise<void> { throw new Error('Vercel CDC requires webhooks'); }
  async stopCDC(): Promise<void> {}
}
