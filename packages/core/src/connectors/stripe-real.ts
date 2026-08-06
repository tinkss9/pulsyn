// Stripe Connector — Real API Integration
// Auth: API key (sk_test_* for test mode, sk_live_* for production)
// API: Stripe REST API v1
// Test: Free test mode at stripe.com (no real charges)

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('stripe-real')
export class StripeRealConnector extends BaseConnector {
  private baseUrl = 'https://api.stripe.com/v1';
  private apiKey = '';
  private cdcActive = false;
  private cdcCallback: ((event: CDCEvent) => void) | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.apiKey = config.token || config.password || config.apiKey || '';

    if (!this.apiKey) {
      throw new Error('Stripe API key required. Get a test key from https://dashboard.stripe.com/apikeys');
    }

    // Verify connection
    const resp = await this.stripeGet('/balance');
    if (!resp.ok) {
      throw new Error(`Stripe connection failed: HTTP ${resp.status}`);
    }
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.apiKey = '';
  }

  async testConnection(): Promise<boolean> {
    try {
      const resp = await this.stripeGet('/balance');
      return resp.ok;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    return [
      'charges', 'customers', 'subscriptions', 'invoices',
      'payment_intents', 'payment_methods', 'payouts',
      'products', 'prices', 'coupons', 'disputes',
      'events', 'files', 'mandates', 'plans',
      'refunds', 'setup_intents', 'transfers',
    ];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schemas: Record<string, TableSchema> = {
      charges: {
        table: 'charges', primaryKeys: ['id'],
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'amount', type: 'number', nullable: false },
          { name: 'currency', type: 'string', nullable: false },
          { name: 'customer', type: 'string', nullable: true },
          { name: 'description', type: 'string', nullable: true },
          { name: 'status', type: 'string', nullable: false },
          { name: 'paid', type: 'boolean', nullable: false },
          { name: 'refunded', type: 'boolean', nullable: false },
          { name: 'disputed', type: 'boolean', nullable: false },
          { name: 'created', type: 'number', nullable: false },
          { name: 'payment_method', type: 'string', nullable: true },
          { name: 'receipt_url', type: 'string', nullable: true },
        ],
      },
      customers: {
        table: 'customers', primaryKeys: ['id'],
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'email', type: 'string', nullable: true },
          { name: 'name', type: 'string', nullable: true },
          { name: 'phone', type: 'string', nullable: true },
          { name: 'description', type: 'string', nullable: true },
          { name: 'balance', type: 'number', nullable: true },
          { name: 'currency', type: 'string', nullable: true },
          { name: 'created', type: 'number', nullable: false },
          { name: 'delinquent', type: 'boolean', nullable: true },
          { name: 'invoice_prefix', type: 'string', nullable: true },
        ],
      },
      subscriptions: {
        table: 'subscriptions', primaryKeys: ['id'],
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'customer', type: 'string', nullable: false },
          { name: 'status', type: 'string', nullable: false },
          { name: 'current_period_start', type: 'number', nullable: false },
          { name: 'current_period_end', type: 'number', nullable: false },
          { name: 'plan', type: 'json', nullable: true },
          { name: 'quantity', type: 'number', nullable: true },
          { name: 'cancel_at_period_end', type: 'boolean', nullable: true },
          { name: 'canceled_at', type: 'number', nullable: true },
          { name: 'created', type: 'number', nullable: false },
        ],
      },
      invoices: {
        table: 'invoices', primaryKeys: ['id'],
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'customer', type: 'string', nullable: false },
          { name: 'amount_due', type: 'number', nullable: false },
          { name: 'amount_paid', type: 'number', nullable: false },
          { name: 'currency', type: 'string', nullable: false },
          { name: 'status', type: 'string', nullable: true },
          { name: 'period_start', type: 'number', nullable: true },
          { name: 'period_end', type: 'number', nullable: true },
          { name: 'created', type: 'number', nullable: false },
        ],
      },
      payment_intents: {
        table: 'payment_intents', primaryKeys: ['id'],
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'amount', type: 'number', nullable: false },
          { name: 'currency', type: 'string', nullable: false },
          { name: 'customer', type: 'string', nullable: true },
          { name: 'status', type: 'string', nullable: false },
          { name: 'payment_method', type: 'string', nullable: true },
          { name: 'created', type: 'number', nullable: false },
        ],
      },
      products: {
        table: 'products', primaryKeys: ['id'],
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'name', type: 'string', nullable: false },
          { name: 'description', type: 'string', nullable: true },
          { name: 'active', type: 'boolean', nullable: false },
          { name: 'created', type: 'number', nullable: false },
          { name: 'updated', type: 'number', nullable: false },
        ],
      },
      payouts: {
        table: 'payouts', primaryKeys: ['id'],
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'amount', type: 'number', nullable: false },
          { name: 'currency', type: 'string', nullable: false },
          { name: 'status', type: 'string', nullable: false },
          { name: 'arrival_date', type: 'number', nullable: true },
          { name: 'created', type: 'number', nullable: false },
        ],
      },
      events: {
        table: 'events', primaryKeys: ['id'],
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'type', type: 'string', nullable: false },
          { name: 'api_version', type: 'string', nullable: true },
          { name: 'created', type: 'number', nullable: false },
          { name: 'data', type: 'json', nullable: false },
        ],
      },
      refunds: {
        table: 'refunds', primaryKeys: ['id'],
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'amount', type: 'number', nullable: false },
          { name: 'charge', type: 'string', nullable: true },
          { name: 'currency', type: 'string', nullable: false },
          { name: 'reason', type: 'string', nullable: true },
          { name: 'status', type: 'string', nullable: true },
          { name: 'created', type: 'number', nullable: false },
        ],
      },
      disputes: {
        table: 'disputes', primaryKeys: ['id'],
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'amount', type: 'number', nullable: false },
          { name: 'charge', type: 'string', nullable: false },
          { name: 'currency', type: 'string', nullable: false },
          { name: 'reason', type: 'string', nullable: false },
          { name: 'status', type: 'string', nullable: false },
          { name: 'created', type: 'number', nullable: false },
        ],
      },
    };
    return schemas[table] || { table, columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }], primaryKeys: ['id'] };
  }

  async extractFull(table: string, opts?: { limit?: number }): Promise<UnifiedChangeEvent[]> {
    const limit = opts?.limit || 100;
    const resp = await this.stripeGet(`/${table}?limit=${limit}`);
    if (!resp.ok) return [];

    const data = await resp.json();
    const items = data.data || [];
    return items.map((item: any) =>
      createEvent({
        op: 'S',
        table,
        after: item,
        watermark: new Date(item.created * 1000).toISOString(),
      })
    );
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    const created = opts?.watermarkValue ? Math.floor(new Date(opts.watermarkValue).getTime() / 1000) : undefined;
    let url = `/${table}?limit=100&created[gte]=${created || 0}`;
    if (opts?.watermarkValue) {
      url = `/${table}?limit=100&created[gte]=${created}`;
    }

    const resp = await this.stripeGet(url);
    if (!resp.ok) return [];

    const data = await resp.json();
    const items = data.data || [];
    return items.map((item: any) =>
      createEvent({
        op: 'S',
        table,
        after: item,
        watermark: new Date(item.created * 1000).toISOString(),
      })
    );
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcCallback = callback;

    // Stripe CDC: Poll the events endpoint for recent changes
    let lastEventId = '';

    const pollInterval = setInterval(async () => {
      if (!this.cdcActive) {
        clearInterval(pollInterval);
        return;
      }

      try {
        let url = '/events?limit=100&type=charge.succeeded&type=customer.created&type=invoice.paid&type=subscription.updated';
        if (lastEventId) {
          url += `&starting_after=${lastEventId}`;
        }

        const resp = await this.stripeGet(url);
        if (!resp.ok) return;

        const data = await resp.json();
        const events = data.data || [];

        for (const event of events) {
          lastEventId = event.id;
          const obj = event.data?.object;
          if (obj) {
            callback({
              before: event.data?.previous_attributes || null,
              after: obj,
              op: event.type?.includes('deleted') ? 'D' : 'U',
              source: { connector: 'stripe-real', table: obj.object || 'unknown' },
              ts: new Date(event.created * 1000),
            });
          }
        }
      } catch {}
    }, 10000); // Poll every 10s
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    this.cdcCallback = null;
  }

  // ── Stripe-Specific Methods ──

  async getBalance(): Promise<any> {
    const resp = await this.stripeGet('/balance');
    if (!resp.ok) return null;
    return resp.json();
  }

  async getCustomer(id: string): Promise<any> {
    const resp = await this.stripeGet(`/customers/${id}`);
    if (!resp.ok) return null;
    return resp.json();
  }

  async getCharge(id: string): Promise<any> {
    const resp = await this.stripeGet(`/charges/${id}`);
    if (!resp.ok) return null;
    return resp.json();
  }

  // ── HTTP Helpers ──

  private async stripeGet(path: string): Promise<Response> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}
