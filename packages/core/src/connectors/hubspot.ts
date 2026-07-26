// HubSpot Connector — CRM SaaS source
// npm install @hubspot/api-client

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let HubSpotClient: any;
try { HubSpotClient = require('@hubspot/api-client').Client; } catch {}

@registerSource('hubspot')
export class HubSpotConnector extends BaseConnector {
  private client: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'hubspot', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!HubSpotClient) throw new Error('@hubspot/api-client not installed');
    this.client = new HubSpotClient({ accessToken: config.password });
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.crm.contacts.basicApi.getPage(); return true; } catch { return false; } }

  async getTables(): Promise<string[]> { return ['contacts', 'companies', 'deals', 'tickets', 'products']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'properties', type: 'object', nullable: true }, { name: 'createdAt', type: 'datetime', nullable: true }, { name: 'updatedAt', type: 'datetime', nullable: true }], primaryKey: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const api = (this.client.crm as any)[table];
    if (!api) throw new Error(`Unsupported HubSpot table: ${table}`);
    const result = await api.basicApi.getPage(100);
    return (result.results || []).map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.id }));
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const api = (this.client.crm as any)[table];
    if (!api) throw new Error(`Unsupported HubSpot table: ${table}`);
    const result = await api.basicApi.getPage(100, watermark || undefined);
    return (result.results || []).map((item: any) => createEvent({ op: 'I', table, after: item, watermark: item.id }));
  }

  async startCDC(): Promise<void> { throw new Error('HubSpot CDC requires webhooks — use polling-based extraction'); }
  async stopCDC(): Promise<void> {}
}
