// Slack Connector — messaging SaaS source
// npm install @slack/web-api

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let WebClient: any;
try { WebClient = require('@slack/web-api').WebClient; } catch {}

@registerSource('slack')
export class SlackConnector extends BaseConnector {
  private client: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'slack', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!WebClient) throw new Error('@slack/web-api not installed');
    this.client = new WebClient(config.password);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.auth.test(); return true; } catch { return false; } }

  async getTables(): Promise<string[]> { return ['channels', 'messages', 'users']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'text', type: 'string', nullable: true }, { name: 'ts', type: 'string', nullable: true }], primaryKey: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    let result;
    switch (table) {
      case 'channels': result = await this.client.conversations.list({ limit: 100 }); return (result.channels || []).map((c: any) => createEvent({ op: 'S', table, after: c, watermark: c.id }));
      case 'users': result = await this.client.users.list({ limit: 100 }); return (result.members || []).map((u: any) => createEvent({ op: 'S', table, after: u, watermark: u.id }));
      default: throw new Error(`Unsupported Slack table: ${table}`);
    }
  }

  async startCDC(): Promise<void> { throw new Error('Slack CDC requires Socket Mode or Events API — not yet implemented'); }
  async stopCDC(): Promise<void> {}
}


