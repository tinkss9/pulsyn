// Dropbox Connector — file storage source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('dropbox')
export class DropboxConnector extends BaseConnector {
  private token: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'dropbox', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.token = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['files', 'folders']; }

  async getTableSchema(): Promise<TableSchema> {
    return {
      name: 'files',
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: true },
        { name: 'size', type: 'number', nullable: true },
        { name: 'server_modified', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(): Promise<UnifiedChangeEvent[]> {
    const res = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '', limit: 100 }),
    });
    const data = await res.json() as any;
    return (data.entries || []).map((item: any) =>
      createEvent({ op: 'S', table: 'files', after: item, watermark: item.id || item.name })
    );
  }

  async startCDC(): Promise<void> { throw new Error('Dropbox CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}


