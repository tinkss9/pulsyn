// Grafana Connector — observability dashboard source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('grafana')
export class GrafanaConnector extends BaseConnector {
  private baseUrl: string = '';
  private token: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'grafana', config); this.baseUrl = `https://${config.host || 'localhost:3000'}/api`; }
  async connect(config: DatabaseConfig): Promise<void> { this.token = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch(`${this.baseUrl}/org`, { headers: { Authorization: `Bearer ${this.token}` } }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['dashboards', 'datasources', 'alerts']; }
  async getTableSchema(table: string): Promise<TableSchema> { return { name: table, columns: [{ name: 'uid', type: 'string', nullable: false }, { name: 'title', type: 'string', nullable: true }, { name: 'created', type: 'datetime', nullable: true }], primaryKey: ['uid'] }; }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const r = await fetch(`${this.baseUrl}/${table}`, { headers: { Authorization: `Bearer ${this.token}` } });
    const d = await r.json() as any;
    return (d || []).map((i: any) => createEvent({ op: 'S', table, after: i, watermark: i.uid || i.id }));
  }
  async startCDC(): Promise<void> { throw new Error('Grafana CDC not supported'); }
  async stopCDC(): Promise<void> {}
}
