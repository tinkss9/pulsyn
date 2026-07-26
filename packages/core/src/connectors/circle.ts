// @ts-nocheck
// Circle Connector — community platform source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('circle')
export class CircleConnector extends BaseConnector {
  private token: string = '';
  private communityId: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'circle', config); this.communityId = (config as any).communityId || ''; }
  async connect(config: DatabaseConfig): Promise<void> { this.token = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch(`https://app.circle.so/api/v1/community/${this.communityId}`, { headers: { Authorization: `Bearer ${this.token}` } }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['members', 'posts', 'spaces']; }
  async getTableSchema(table: string): Promise<TableSchema> { return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'name', type: 'string', nullable: true }, { name: 'email', type: 'string', nullable: true }], primaryKey: ['id'] }; }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const r = await fetch(`https://app.circle.so/api/v1/${table}?per_page=100`, { headers: { Authorization: `Bearer ${this.token}` } });
    const d = await r.json() as any;
    return (d || []).map((i: any) => createEvent({ op: 'S', table, after: i, watermark: i.id }));
  }
  async startCDC(): Promise<void> { throw new Error('Circle CDC requires webhooks'); }
  async stopCDC(): Promise<void> {}
}



