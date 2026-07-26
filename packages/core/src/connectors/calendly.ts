// Calendly Connector — scheduling SaaS source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('calendly')
export class CalendlyConnector extends BaseConnector {
  private token: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'calendly', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.token = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.calendly.com/users/me', {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['events', 'invitees', 'event_types']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'uri', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: true },
        { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['uri'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const endpoint = table === 'events' ? 'scheduled_events' : table;
    const res = await fetch(`https://api.calendly.com/${endpoint}?count=100`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const data = await res.json() as any;
    return (data.collection || []).map((item: any) =>
      createEvent({ op: 'S', table, after: item, watermark: item.uri })
    );
  }

  async startCDC(): Promise<void> { throw new Error('Calendly CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}
