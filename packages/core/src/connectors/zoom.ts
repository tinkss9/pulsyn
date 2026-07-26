// Zoom Connector — video meetings source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('zoom')
export class ZoomConnector extends BaseConnector {
  private jwtToken: string = '';
  private accountId: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'zoom', config);
    this.accountId = (config as any).accountId || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.jwtToken = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.zoom.us/v2/users/me', {
        headers: { Authorization: `Bearer ${this.jwtToken}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['meetings', 'webinars', 'recordings', 'users']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'topic', type: 'string', nullable: true },
        { name: 'start_time', type: 'datetime', nullable: true },
        { name: 'duration', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`https://api.zoom.us/v2/${table}?page_size=100`, {
      headers: { Authorization: `Bearer ${this.jwtToken}` },
    });
    const data = await res.json() as any;
    return (data.meetings || data.webinars || data.recordings || data.users || []).map((item: any) =>
      createEvent({ op: 'S', table, after: item, watermark: String(item.id) })
    );
  }

  async startCDC(): Promise<void> { throw new Error('Zoom CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}


