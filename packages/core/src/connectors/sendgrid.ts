// @ts-nocheck
// SendGrid Connector — email SaaS source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let sgMail: any;
try { sgMail = require('@sendgrid/mail'); } catch {}

@registerSource('sendgrid')
export class SendGridConnector extends BaseConnector {
  private apiKey: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'sendgrid', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiKey = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['contacts', 'templates', 'campaigns']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'email', type: 'string', nullable: true },
        { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`https://api.sendgrid.com/v3/marketing/${table}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    const data = await res.json() as any;
    return (data.result || []).map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.id }));
  }

  async startCDC(): Promise<void> { throw new Error('SendGrid CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}



