// OneDrive Connector
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('onedrive')
export class OneDriveConnector extends BaseConnector {
  private token: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'onedrive', config); }
  async connect(config: DatabaseConfig): Promise<void> { this.token = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch('https://graph.microsoft.com/v1.0/me/drive', { headers: { Authorization: `Bearer ${this.token}` } }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['files', 'folders']; }
  async getTableSchema(): Promise<TableSchema> { return { name: 'files', columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'name', type: 'string', nullable: true }, { name: 'size', type: 'number', nullable: true }], primaryKey: ['id'] }; }
  async extractFull(): Promise<UnifiedChangeEvent[]> {
    const r = await fetch('https://graph.microsoft.com/v1.0/me/drive/root/children', { headers: { Authorization: `Bearer ${this.token}` } });
    const d = await r.json() as any;
    return (d.value || []).map((i: any) => createEvent({ op: 'S', table: 'files', after: i, watermark: i.id }));
  }
  async startCDC(): Promise<void> { throw new Error('OneDrive CDC requires webhooks'); }
  async stopCDC(): Promise<void> {}
}
