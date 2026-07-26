// @ts-nocheck
// Cloudflare Connector — CDN/DNS source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('cloudflare')
export class CloudflareConnector extends BaseConnector {
  private token: string = '';
  private zoneId: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'cloudflare', config);
    this.zoneId = (config as any).zoneId || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.token = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.cloudflare.com/client/v4/user', {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['zones', 'dns_records', 'analytics']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: true },
        { name: 'type', type: 'string', nullable: true },
        { name: 'created_on', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const endpoint = table === 'zones' ? 'zones' : `zones/${this.zoneId}/${table}`;
    const res = await fetch(`https://api.cloudflare.com/client/v4/${endpoint}?per_page=100`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const data = await res.json() as any;
    return (data.result || []).map((item: any) =>
      createEvent({ op: 'S', table, after: item, watermark: item.id })
    );
  }

  async startCDC(): Promise<void> { throw new Error('Cloudflare CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}



