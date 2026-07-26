// Twilio Connector — messaging/voice SaaS source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let twilio: any;
try { twilio = require('twilio'); } catch {}

@registerSource('twilio')
export class TwilioConnector extends BaseConnector {
  private client: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'twilio', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!twilio) throw new Error('twilio not installed');
    this.client = twilio(config.user, config.password);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> {
    try { await this.client.api.accounts.list({ limit: 1 }); return true; } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['messages', 'calls', 'phone_numbers']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'sid', type: 'string', nullable: false },
        { name: 'status', type: 'string', nullable: true },
        { name: 'date_created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['sid'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    let items: any[] = [];
    switch (table) {
      case 'messages': items = (await this.client.messages.list({ limit: 100 })); break;
      case 'calls': items = (await this.client.calls.list({ limit: 100 })); break;
      default: throw new Error(`Unsupported table: ${table}`);
    }
    return items.map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.sid }));
  }

  async startCDC(): Promise<void> { throw new Error('Twilio CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}


