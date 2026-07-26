// @ts-nocheck
// Intercom Connector — customer messaging SaaS source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('intercom')
export class IntercomConnector extends BaseConnector {
  private token: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'intercom', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.token = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.intercom.io/me', {
        headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/json' },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['contacts', 'conversations', 'companies']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: true },
        { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`https://api.intercom.io/${table}?per_page=100`, {
      headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/json' },
    });
    const data = await res.json() as any;
    return (data.data || []).map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.id }));
  }

  async startCDC(): Promise<void> { throw new Error('Intercom CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}



