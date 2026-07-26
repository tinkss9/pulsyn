// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface StripeConfig extends DatabaseConfig {
  apiKey: string;
}

@registerSource('stripe')
export class StripeConnector extends BaseConnector {
  private baseUrl = 'https://api.stripe.com';
  private apiKey = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  private readonly resources: Record<string, string> = {
    customers: '/v1/customers',
    charges: '/v1/charges',
    invoices: '/v1/invoices',
    subscriptions: '/v1/subscriptions',
    payments: '/v1/payment_intents',
    products: '/v1/products',
    prices: '/v1/prices',
    refunds: '/v1/refunds',
    disputes: '/v1/disputes',
    balance_transactions: '/v1/balance_transactions',
  };

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const sc = config as StripeConfig;
    this.apiKey = sc.apiKey;
    if (!this.apiKey) throw new Error('Stripe: apiKey required');
    const ok = await this.testConnection();
    if (!ok) throw new Error('Stripe connection test failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.stripeFetch('/v1/customers?limit=1');
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return Object.keys(this.resources);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const endpoint = this.resources[table];
    if (!endpoint) throw new Error(`Unknown Stripe resource: ${table}`);
    const res = await this.stripeFetch(`${endpoint}?limit=1`);
    if (!res.ok) throw new Error(`Schema fetch failed: ${res.status}`);
    const data = await res.json() as any;
    const sample = data.data?.[0];
    if (!sample) return { table, columns: [], primaryKeys: ['id'] };
    const columns = Object.entries(sample).map(([name, value]) => ({
      name, type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
      nullable: value === null, defaultValue: null,
    }));
    return { table, columns, primaryKeys: ['id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const lastTs: Record<string, number> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        for (const [table, endpoint] of Object.entries(this.resources)) {
          const since = lastTs[table] || Math.floor(Date.now() / 1000) - 60;
          const res = await this.stripeFetch(`${endpoint}?created[gte]=${since}&limit=100`);
          if (!res.ok) continue;
          const data = await res.json() as any;
          for (const item of data.data || []) {
            callback({ op: 'I', table, before: null, after: item, ts: new Date(item.created * 1000) });
          }
          lastTs[table] = Math.floor(Date.now() / 1000);
        }
      } catch { /* retry next cycle */ }
    }, 10000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const endpoint = this.resources[table];
    if (!endpoint) throw new Error(`Unknown resource: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let startingAfter: string | undefined = undefined;

    while (true) {
      const params = new URLSearchParams({ limit: '100' });
      if (startingAfter) params.set('starting_after', startingAfter);

      const res = await this.stripeFetch(`${endpoint}?${params}`);
      if (!res.ok) throw new Error(`Stripe extract failed: ${res.status}`);
      const data = await res.json() as any;
      const items = data.data || [];

      for (const item of items) {
        events.push(createEvent({
          op: 'S', table, after: item,
          watermark: item.id,
          sourceMetadata: { source: 'stripe', id: item.id },
        }));
        startingAfter = item.id;
      }

      if (!data.has_more || items.length === 0) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const endpoint = this.resources[table];
    if (!endpoint) throw new Error(`Unknown resource: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    const since = watermark ? parseInt(watermark, 10) : Math.floor(Date.now() / 1000) - 86400;
    let startingAfter: string | undefined = undefined;

    while (true) {
      const params = new URLSearchParams({ limit: '100', 'created[gte]': since.toString() });
      if (startingAfter) params.set('starting_after', startingAfter);

      const res = await this.stripeFetch(`${endpoint}?${params}`);
      if (!res.ok) throw new Error(`Stripe incremental failed: ${res.status}`);
      const data = await res.json() as any;
      const items = data.data || [];

      for (const item of items) {
        events.push(createEvent({
          op: 'I', table, after: item,
          watermark: item.created?.toString() || null,
          sourceMetadata: { source: 'stripe', id: item.id },
        }));
        startingAfter = item.id;
      }

      if (!data.has_more || items.length === 0) break;
    }
    return events;
  }

  private async stripeFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      ...(init?.headers as Record<string, string> || {}),
    };
    return this.fetchWithRetry(url, { ...init, headers });
  }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch(url, init);
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10);
        await this.sleep(retryAfter * 1000);
        continue;
      }
      if (res.status >= 500 && i < retries) {
        await this.sleep(Math.min(1000 * Math.pow(2, i), 30000));
        continue;
      }
      return res;
    }
    throw new Error('Stripe: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

