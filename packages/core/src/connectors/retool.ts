// @ts-nocheck
// Retool Connector — internal tools source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('retool')
export class RetoolConnector extends BaseConnector {
  private token: string = '';
  private baseUrl: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'retool', config); this.baseUrl = `https://${config.host || 'api.retool.com'}/v1`; }
  async connect(config: DatabaseConfig): Promise<void> { this.token = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch(`${this.baseUrl}/resources`, { headers: { Authorization: `Bearer ${this.token}` } }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['resources', 'workflows', 'apps']; }
  async getTableSchema(table: string): Promise<TableSchema> { return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'name', type: 'string', nullable: true }], primaryKey: ['id'] }; }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const r = await fetch(`${this.baseUrl}/${table}`, { headers: { Authorization: `Bearer ${this.token}` } });
    const d = await r.json() as any;
    return (d || []).map((i: any) => createEvent({ op: 'S', table, after: i, watermark: i.id }));
  }
  async startCDC(): Promise<void> { throw new Error('Retool CDC not supported'); }
  async stopCDC(): Promise<void> {}
}



