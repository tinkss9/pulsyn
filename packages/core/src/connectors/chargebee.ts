// Chargebee Connector — subscription billing source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('chargebee')
export class ChargebeeConnector extends BaseConnector {
  private site: string = '';
  private apiKey: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'chargebee', config);
    this.site = (config as any).site || config.host || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiKey = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const auth = Buffer.from(`${this.apiKey}:`).toString('base64');
      const res = await fetch(`https://${this.site}.chargebee.com/api/v2/subscriptions?limit=1`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['subscriptions', 'customers', 'invoices', 'plans']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'status', type: 'string', nullable: true },
        { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const auth = Buffer.from(`${this.apiKey}:`).toString('base64');
    const res = await fetch(`https://${this.site}.chargebee.com/api/v2/${table}?limit=100`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const data = await res.json() as any;
    return (data.list || []).map((item: any) =>
      createEvent({ op: 'S', table, after: item, watermark: item.id })
    );
  }

  async startCDC(): Promise<void> { throw new Error('Chargebee CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}


