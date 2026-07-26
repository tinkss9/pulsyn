// @ts-nocheck
// Braintree connector — Public/private key auth, gateway transactions search
// Date range queries, page pagination

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface BraintreeConfig extends DatabaseConfig {
  merchantId: string;
  publicKey: string;
  privateKey: string;
  environment?: 'sandbox' | 'production';
}

const BRAINTREE_TABLES: Record<string, { pk: string; searchPath: string; columns: any[] }> = {
  transactions: {
    pk: 'id',
    searchPath: '/merchants/{merchantId}/transactions/advanced_search',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'amount', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'currency_iso_code', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'type', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'merchant_account_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'customer_id', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'payment_method_type', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'updated_at', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  customers: {
    pk: 'id',
    searchPath: '/merchants/{merchantId}/customers/advanced_search',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'first_name', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'last_name', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'email', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'company', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'updated_at', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  subscriptions: {
    pk: 'id',
    searchPath: '/merchants/{merchantId}/subscriptions/advanced_search',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'plan_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'price', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'payment_method_token', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'updated_at', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
};

@registerSource('braintree')
export class BraintreeConnector extends BaseConnector {
  private merchantId = '';
  private publicKey = '';
  private privateKey = '';
  private baseUrl = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    const bc = config as BraintreeConfig;
    this.merchantId = bc.merchantId;
    this.publicKey = bc.publicKey;
    this.privateKey = bc.privateKey;
    this.baseUrl = bc.environment === 'production'
      ? 'https://api.braintreegateway.com' : 'https://api.sandbox.braintreegateway.com';
    this.config = config;
    const ok = await this.testConnection();
    if (!ok) throw new Error('Braintree connection failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> { await this.stopCDC(); this.connected = false; }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/merchants/${this.merchantId}/transactions?page=1`, {
        headers: this.authHeaders(), method: 'POST', body: '<search></search>',
      });
      return res.status < 500;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return Object.keys(BRAINTREE_TABLES); }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = BRAINTREE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    return { table, columns: def.columns, primaryKeys: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      const since = new Date(Date.now() - 60000).toISOString();
      const body = `<search><created-at><min>${since}</min></created-at></search>`;
      const res = await fetch(this.searchUrl('transactions'), { method: 'POST', headers: this.authHeaders(), body });
      if (!res.ok) return;
      const data = await res.text();
      const items = this.parseXmlItems(data);
      for (const item of items) {
        callback({ op: 'I', table: 'transactions', before: null, after: item, ts: new Date() });
      }
    }, 30000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const def = BRAINTREE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let page = 1;

    while (true) {
      const body = `<search><page>${page}</page></search>`;
      const res = await fetch(this.searchUrl(table), { method: 'POST', headers: this.authHeaders(), body });
      if (!res.ok) throw new Error(`Braintree API error: ${res.status}`);
      const data = await res.text();
      const items = this.parseXmlItems(data);
      if (items.length === 0) break;

      for (const item of items) {
        events.push(createEvent('S', table, item, null, item.id, { source: 'braintree' }));
      }
      if (items.length < 50) break;
      page++;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = BRAINTREE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString();
    let page = 1;

    while (true) {
      const body = `<search><created-at><min>${since}</min></created-at><page>${page}</page></search>`;
      const res = await fetch(this.searchUrl(table), { method: 'POST', headers: this.authHeaders(), body });
      if (!res.ok) throw new Error(`Braintree API error: ${res.status}`);
      const data = await res.text();
      const items = this.parseXmlItems(data);
      if (items.length === 0) break;

      for (const item of items) {
        const ts = item.updated_at || item.created_at || new Date().toISOString();
        events.push(createEvent('I', table, item, null, ts, { source: 'braintree' }));
      }
      if (items.length < 50) break;
      page++;
    }
    return events;
  }

  async getPrimaryKey(table: string): Promise<string> { return BRAINTREE_TABLES[table]?.pk || 'id'; }

  private searchUrl(table: string): string {
    return `${this.baseUrl}/merchants/${this.merchantId}/${table}/advanced_search`;
  }

  private authHeaders(): Record<string, string> {
    const creds = Buffer.from(`${this.publicKey}:${this.privateKey}`).toString('base64');
    return { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/xml', 'Accept': 'application/xml' };
  }

  private parseXmlItems(xml: string): Record<string, any>[] {
    const items: Record<string, any>[] = [];
    const matches = xml.match(/<(transaction|customer|subscription)>([\s\S]*?)<\/\1>/g) || [];
    for (const match of matches) {
      const obj: Record<string, any> = {};
      const fields = match.match(/<([^/][^>]*)>([^<]*)<\/\1>/g) || [];
      for (const field of fields) {
        const [, key, val] = field.match(/<([^>]+)>([^<]*)<\/\1>/) || [];
        if (key && val) obj[key.replace(/-/g, '_')] = val;
      }
      if (Object.keys(obj).length > 0) items.push(obj);
    }
    return items;
  }
}

