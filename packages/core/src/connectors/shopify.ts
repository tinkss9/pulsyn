// Shopify Connector — e-commerce SaaS source
// npm install @shopify/shopify-api

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let shopifyApi: any;
try { shopifyApi = require('@shopify/shopify-api'); } catch {}

@registerSource('shopify')
export class ShopifyConnector extends BaseConnector {
  private client: any = null;
  private shop: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'shopify', config);
    this.shop = config.host || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!shopifyApi) throw new Error('@shopify/shopify-api not installed');
    const shopify = shopifyApi.default || shopifyApi;
    this.client = new shopify.clients.Rest({ session: { shop: this.shop, accessToken: config.password } });
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.get({ path: '/admin/api/2024-01/shop.json' }); return true; } catch { return false; } }

  async getTables(): Promise<string[]> { return ['products', 'orders', 'customers', 'inventory', 'collections']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, columns: [{ name: 'id', type: 'number', nullable: false }, { name: 'title', type: 'string', nullable: true }, { name: 'created_at', type: 'datetime', nullable: true }, { name: 'updated_at', type: 'datetime', nullable: true }], primaryKey: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const result = await this.client.get({ path: `/admin/api/2024-01/${table}.json`, query: { limit: 250 } });
    return (result.body[table] || []).map((item: any) => createEvent({ op: 'S', table, after: item, watermark: String(item.id) }));
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const params: any = { limit: 250 };
    if (watermark) params.updated_at_min = watermark;
    const result = await this.client.get({ path: `/admin/api/2024-01/${table}.json`, query: params });
    return (result.body[table] || []).map((item: any) => createEvent({ op: 'I', table, after: item, watermark: item.updated_at || String(item.id) }));
  }

  async startCDC(): Promise<void> { throw new Error('Shopify CDC requires webhooks — use polling-based extraction'); }
  async stopCDC(): Promise<void> {}
}
