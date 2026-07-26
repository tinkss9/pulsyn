// @ts-nocheck
// Stripe Payments connector — balance_transactions, payouts, disputes, refunds
// API key auth, cursor pagination

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface StripeConfig extends DatabaseConfig {
  apiKey: string;
  apiVersion?: string;
  baseUrl?: string;
}

const STRIPE_TABLES: Record<string, { endpoint: string; pk: string; columns: any[] }> = {
  balance_transactions: {
    endpoint: '/v1/balance_transactions',
    pk: 'id',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'amount', type: 'integer', nullable: false, defaultValue: null },
      { name: 'currency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'type', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'source', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'description', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'net', type: 'integer', nullable: false, defaultValue: null },
      { name: 'fee', type: 'integer', nullable: false, defaultValue: null },
      { name: 'created', type: 'integer', nullable: false, defaultValue: null },
      { name: 'available_on', type: 'integer', nullable: false, defaultValue: null },
    ],
  },
  payouts: {
    endpoint: '/v1/payouts',
    pk: 'id',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'amount', type: 'integer', nullable: false, defaultValue: null },
      { name: 'currency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'arrival_date', type: 'integer', nullable: false, defaultValue: null },
      { name: 'method', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'description', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'created', type: 'integer', nullable: false, defaultValue: null },
    ],
  },
  disputes: {
    endpoint: '/v1/disputes',
    pk: 'id',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'amount', type: 'integer', nullable: false, defaultValue: null },
      { name: 'currency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'charge', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'reason', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'created', type: 'integer', nullable: false, defaultValue: null },
    ],
  },
  refunds: {
    endpoint: '/v1/refunds',
    pk: 'id',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'amount', type: 'integer', nullable: false, defaultValue: null },
      { name: 'currency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'charge', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'reason', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'created', type: 'integer', nullable: false, defaultValue: null },
    ],
  },
};

@registerSource('stripe-payments')
export class StripePaymentsConnector extends BaseConnector {
  private apiKey = '';
  private baseUrl = 'https://api.stripe.com';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    const sc = config as StripeConfig;
    this.apiKey = sc.apiKey;
    this.baseUrl = sc.baseUrl || 'https://api.stripe.com';
    this.config = config;
    const ok = await this.testConnection();
    if (!ok) throw new Error('Stripe connection failed: invalid API key');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/balance`, { headers: this.authHeaders() });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return Object.keys(STRIPE_TABLES); }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = STRIPE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    return { table, columns: def.columns, primaryKeys: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      for (const [table, def] of Object.entries(STRIPE_TABLES)) {
        const res = await fetch(`${this.baseUrl}${def.endpoint}?limit=10`, { headers: this.authHeaders() });
        if (!res.ok) continue;
        const data = await res.json() as any;
        for (const item of data.data || []) {
          callback({ op: 'U', table, before: null, after: item, ts: new Date() });
        }
      }
    }, 30000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const def = STRIPE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let cursor: string | null = null;

    while (true) {
      const params = new URLSearchParams({ limit: String(Math.min(this.batchSize, 100)) });
      if (cursor) params.set('starting_after', cursor);
      const res = await fetch(`${this.baseUrl}${def.endpoint}?${params}`, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`Stripe API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data.data || [];
      if (items.length === 0) break;

      for (const item of items) {
        events.push(createEvent('S', table, item, null, item.created?.toString(), { source: 'stripe-payments' }));
        cursor = item.id;
      }
      if (!data.has_more) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = STRIPE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let cursor: string | null = null;

    while (true) {
      const params = new URLSearchParams({ limit: '100' });
      if (cursor) params.set('starting_after', cursor);
      if (watermark) params.set('created[gte]', watermark);
      const res = await fetch(`${this.baseUrl}${def.endpoint}?${params}`, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`Stripe API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data.data || [];
      if (items.length === 0) break;

      for (const item of items) {
        events.push(createEvent('I', table, item, null, item.created?.toString(), { source: 'stripe-payments' }));
        cursor = item.id;
      }
      if (!data.has_more) break;
    }
    return events;
  }

  async estimateRowCount(table: string): Promise<number> {
    const def = STRIPE_TABLES[table];
    if (!def) return 0;
    const res = await fetch(`${this.baseUrl}${def.endpoint}?limit=1`, { headers: this.authHeaders() });
    if (!res.ok) return 0;
    const data = await res.json() as any;
    return data.total_count ?? data.data?.length ?? 0;
  }

  async getPrimaryKey(table: string): Promise<string> { return STRIPE_TABLES[table]?.pk || 'id'; }

  private authHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': (this.config as StripeConfig).apiVersion || '2024-06-20',
    };
  }
}

