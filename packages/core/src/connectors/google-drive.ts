// Google Drive Connector
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('google-drive')
export class GoogleDriveConnector extends BaseConnector {
  private token: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'google-drive', config); }
  async connect(config: DatabaseConfig): Promise<void> { this.token = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', { headers: { Authorization: `Bearer ${this.token}` } }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['files', 'folders']; }
  async getTableSchema(): Promise<TableSchema> { return { name: 'files', columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'name', type: 'string', nullable: true }, { name: 'mimeType', type: 'string', nullable: true }], primaryKey: ['id'] }; }
  async extractFull(): Promise<UnifiedChangeEvent[]> {
    const r = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=100', { headers: { Authorization: `Bearer ${this.token}` } });
    const d = await r.json() as any;
    return (d.files || []).map((i: any) => createEvent({ op: 'S', table: 'files', after: i, watermark: i.id }));
  }
  async startCDC(): Promise<void> { throw new Error('Google Drive CDC requires push notifications'); }
  async stopCDC(): Promise<void> {}
}
