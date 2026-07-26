// @ts-nocheck
// Loom Connector — video recording source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('loom')
export class LoomConnector extends BaseConnector {
  private token: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'loom', config); }
  async connect(config: DatabaseConfig): Promise<void> { this.token = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch('https://api.loom.com/v1/oauth/current-user', { headers: { Authorization: `Bearer ${this.token}` } }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['videos', 'folders']; }
  async getTableSchema(): Promise<TableSchema> { return { name: 'videos', columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'title', type: 'string', nullable: true }, { name: 'created_at', type: 'datetime', nullable: true }], primaryKey: ['id'] }; }
  async extractFull(): Promise<UnifiedChangeEvent[]> {
    const r = await fetch('https://api.loom.com/v1/videos?limit=100', { headers: { Authorization: `Bearer ${this.token}` } });
    const d = await r.json() as any;
    return (d || []).map((i: any) => createEvent({ op: 'S', table: 'videos', after: i, watermark: i.id }));
  }
  async startCDC(): Promise<void> { throw new Error('Loom CDC requires webhooks'); }
  async stopCDC(): Promise<void> {}
}



