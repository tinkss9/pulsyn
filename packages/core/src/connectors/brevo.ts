// Brevo (Sendinblue) Connector — email marketing SaaS source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('brevo')
export class BrevoConnector extends BaseConnector {
  private apiKey: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'brevo', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiKey = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.brevo.com/v3/account', {
        headers: { 'api-key': this.apiKey },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['contacts', 'lists', 'campaigns']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'email', type: 'string', nullable: true },
        { name: 'firstName', type: 'string', nullable: true },
        { name: 'lastName', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`https://api.brevo.com/v3/${table}?limit=100`, {
      headers: { 'api-key': this.apiKey },
    });
    const data = await res.json() as any;
    const items = data.contacts || data.lists || data.campaigns || [];
    return items.map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.id || item.email }));
  }

  async startCDC(): Promise<void> { throw new Error('Brevo CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}


