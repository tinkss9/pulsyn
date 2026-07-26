// Klaviyo Connector — email/SMS marketing SaaS source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('klaviyo')
export class KlaviyoConnector extends BaseConnector {
  private apiKey: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'klaviyo', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiKey = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://a.klaviyo.com/api/profiles/?page[size]=1', {
        headers: { Authorization: `Klaviyo-API-Key ${this.apiKey}`, Revision: '2024-02-15' },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['profiles', 'lists', 'campaigns', 'flows']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'type', type: 'string', nullable: true },
        { name: 'attributes', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const endpoint = table === 'profiles' ? 'profiles' : table;
    const res = await fetch(`https://a.klaviyo.com/api/${endpoint}/?page[size]=100`, {
      headers: { Authorization: `Klaviyo-API-Key ${this.apiKey}`, Revision: '2024-02-15' },
    });
    const data = await res.json() as any;
    return (data.data || []).map((item: any) =>
      createEvent({ op: 'S', table, after: { id: item.id, ...item.attributes }, watermark: item.id })
    );
  }

  async startCDC(): Promise<void> { throw new Error('Klaviyo CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}


