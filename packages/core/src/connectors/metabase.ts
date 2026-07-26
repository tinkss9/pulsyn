// @ts-nocheck
// Metabase Connector — BI dashboard source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('metabase')
export class MetabaseConnector extends BaseConnector {
  private baseUrl: string = '';
  private token: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'metabase', config); this.baseUrl = `https://${config.host || 'localhost:3000'}/api`; }
  async connect(config: DatabaseConfig): Promise<void> { this.token = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch(`${this.baseUrl}/user/current`, { headers: { 'X-API-Key': this.token } }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['databases', 'collections', 'questions', 'dashboards']; }
  async getTableSchema(table: string): Promise<TableSchema> { return { name: table, columns: [{ name: 'id', type: 'number', nullable: false }, { name: 'name', type: 'string', nullable: true }, { name: 'created_at', type: 'datetime', nullable: true }], primaryKey: ['id'] }; }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const r = await fetch(`${this.baseUrl}/${table}`, { headers: { 'X-API-Key': this.token } });
    const d = await r.json() as any;
    return (d || []).map((i: any) => createEvent({ op: 'S', table, after: i, watermark: String(i.id) }));
  }
  async startCDC(): Promise<void> { throw new Error('Metabase CDC not supported'); }
  async stopCDC(): Promise<void> {}
}



