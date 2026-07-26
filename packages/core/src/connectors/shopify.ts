// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface ShopifyConfig extends DatabaseConfig {
  shop: string;
  accessToken: string;
  apiVersion?: string;
}

@registerSource('shopify')
export class ShopifyConnector extends BaseConnector {
  private baseUrl = '';
  private accessToken = '';
  private apiVersion = '2024-01';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  private readonly resources = ['products', 'orders', 'customers', 'collections', 'inventory_items', 'fulfillments'];

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const sc = config as ShopifyConfig;
    this.accessToken = sc.accessToken;
    this.apiVersion = sc.apiVersion || '2024-01';
    this.baseUrl = `https://${sc.shop}.myshopify.com/admin/api/${this.apiVersion}`;

    const ok = await this.testConnection();
    if (!ok) throw new Error('Shopify connection test failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.shopFetch('/shop.json');
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return [...this.resources];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const res = await this.shopFetch(`/${table}.json?limit=1`);
    if (!res.ok) throw new Error(`Schema fetch failed: ${res.status}`);
    const data = await res.json() as any;
    const items = data[table] || [];
    const sample = items[0];
    if (!sample) return { table, columns: [], primaryKeys: ['id'] };
    const columns = Object.entries(sample).map(([name, value]) => ({
      name, type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
      nullable: value === null, defaultValue: null,
    }));
    return { table, columns, primaryKeys: ['id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const watermarks: Record<string, string> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        for (const resource of this.resources) {
          const since = watermarks[resource] || new Date(Date.now() - 60000).toISOString();
          const res = await this.shopFetch(`/${resource}.json?updated_at_min=${since}&limit=50`);
          if (!res.ok) continue;
          const data = await res.json() as any;
          for (const item of data[resource] || []) {
            callback({ op: 'U', table: resource, before: null, after: item, ts: new Date() });
          }
          watermarks[resource] = new Date().toISOString();
        }
      } catch { /* retry */ }
    }, 10000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    let url: string | null = `/${table}.json?limit=250`;

    while (url) {
      const res = await this.shopFetch(url);
      if (!res.ok) throw new Error(`Shopify extract failed: ${res.status}`);
      const data = await res.json() as any;
      const items = data[table] || [];

      for (const item of items) {
        events.push(createEvent({
          op: 'S', table, after: item,
          watermark: item.id?.toString() || null,
          sourceMetadata: { source: 'shopify', id: item.id },
        }));
      }

      // Cursor pagination via Link header (page_info)
      url = this.parseNextPageUrl(res.headers.get('Link'));
      if (items.length === 0) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString();
    let url: string | null = `/${table}.json?updated_at_min=${since}&limit=250`;

    while (url) {
      const res = await this.shopFetch(url);
      if (!res.ok) throw new Error(`Shopify incremental failed: ${res.status}`);
      const data = await res.json() as any;
      const items = data[table] || [];

      for (const item of items) {
        events.push(createEvent({
          op: 'U', table, after: item,
          watermark: item.updated_at || null,
          sourceMetadata: { source: 'shopify', id: item.id },
        }));
      }

      url = this.parseNextPageUrl(res.headers.get('Link'));
      if (items.length === 0) break;
    }
    return events;
  }

  private parseNextPageUrl(linkHeader: string | null): string | null {
    if (!linkHeader) return null;
    const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    if (!match) return null;
    try {
      const parsed = new URL(match[1]);
      return parsed.pathname.replace(`/admin/api/${this.apiVersion}`, '') + parsed.search;
    } catch { return null; }
  }

  private async shopFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'X-Shopify-Access-Token': this.accessToken,
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string> || {}),
    };
    return this.fetchWithRetry(url, { ...init, headers });
  }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch(url, init);
      if (res.status === 429) {
        const retryAfter = parseFloat(res.headers.get('Retry-After') || '2');
        await this.sleep(retryAfter * 1000);
        continue;
      }
      if (res.status >= 500 && i < retries) {
        await this.sleep(Math.min(1000 * Math.pow(2, i), 30000));
        continue;
      }
      return res;
    }
    throw new Error('Shopify: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

