// Mailchimp Connector — email marketing SaaS source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('mailchimp')
export class MailchimpConnector extends BaseConnector {
  private apiKey: string = '';
  private server: string = '';
  private listId: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'mailchimp', config);
    this.server = (config as any).server || 'us1';
    this.listId = (config as any).listId || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiKey = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`https://${this.server}.api.mailchimp.com/3.0/ping`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['lists', 'members', 'campaigns']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: true },
        { name: 'email', type: 'string', nullable: true },
        { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    let url = '';
    switch (table) {
      case 'lists': url = `https://${this.server}.api.mailchimp.com/3.0/lists`; break;
      case 'members': url = `https://${this.server}.api.mailchimp.com/3.0/lists/${this.listId}/members`; break;
      case 'campaigns': url = `https://${this.server}.api.mailchimp.com/3.0/campaigns`; break;
      default: throw new Error(`Unsupported table: ${table}`);
    }
    const res = await fetch(url, { headers: { Authorization: `Bearer ${this.apiKey}` } });
    const data = await res.json() as any;
    const items = data.lists || data.members || data.campaigns || [];
    return items.map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.id }));
  }

  async startCDC(): Promise<void> { throw new Error('Mailchimp CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}
