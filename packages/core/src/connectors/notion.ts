// Notion Connector — workspace SaaS source
// npm install @notionhq/client

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let Client: any;
try { Client = require('@notionhq/client').Client; } catch {}

@registerSource('notion')
export class NotionConnector extends BaseConnector {
  private client: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'notion', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!Client) throw new Error('@notionhq/client not installed');
    this.client = new Client({ auth: config.password });
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.users.me(); return true; } catch { return false; } }

  async getTables(): Promise<string[]> { return ['databases', 'pages', 'blocks']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'object', type: 'string', nullable: true }, { name: 'created_time', type: 'datetime', nullable: true }, { name: 'last_edited_time', type: 'datetime', nullable: true }], primaryKey: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    let result;
    switch (table) {
      case 'databases': result = await this.client.search({ filter: { property: 'object', value: 'database' }, page_size: 100 }); break;
      case 'pages': result = await this.client.search({ filter: { property: 'object', value: 'page' }, page_size: 100 }); break;
      default: throw new Error(`Unsupported Notion table: ${table}`);
    }
    return (result.results || []).map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.id }));
  }

  async startCDC(): Promise<void> { throw new Error('Notion CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}


