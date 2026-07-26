// @ts-nocheck
// PayPal connector — OAuth2 client credentials, /v1/reporting/transactions
// Date range queries, page/page_size pagination

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface PayPalConfig extends DatabaseConfig {
  clientId: string;
  clientSecret: string;
  sandbox?: boolean;
  baseUrl?: string;
}

const PAYPAL_TABLES: Record<string, { endpoint: string; pk: string; columns: any[] }> = {
  transactions: {
    endpoint: '/v1/reporting/transactions',
    pk: 'transaction_id',
    columns: [
      { name: 'transaction_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'transaction_status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'transaction_amount_value', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'transaction_amount_currency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'payer_name', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'payer_email', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'transaction_initiation_date', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'transaction_updated_date', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  payments: {
    endpoint: '/v2/payments/captures',
    pk: 'id',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'amount_value', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'amount_currency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'create_time', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'update_time', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  disputes: {
    endpoint: '/v1/customer/disputes',
    pk: 'dispute_id',
    columns: [
      { name: 'dispute_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'reason', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'dispute_amount_value', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'dispute_amount_currency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'create_time', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'update_time', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
};

@registerSource('paypal')
export class PayPalConnector extends BaseConnector {
  private accessToken = '';
  private tokenExpiry = 0;
  private baseUrl = '';
  private clientId = '';
  private clientSecret = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    const pc = config as PayPalConfig;
    this.clientId = pc.clientId;
    this.clientSecret = pc.clientSecret;
    this.baseUrl = pc.baseUrl || (pc.sandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com');
    this.config = config;
    await this.authenticate();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.accessToken = '';
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.ensureToken();
      const res = await fetch(`${this.baseUrl}/v1/reporting/transactions?start_date=${this.daysAgo(1)}&end_date=${new Date().toISOString()}&page_size=1`, { headers: this.authHeaders() });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return Object.keys(PAYPAL_TABLES); }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = PAYPAL_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    return { table, columns: def.columns, primaryKeys: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      await this.ensureToken();
      const url = `${this.baseUrl}/v1/reporting/transactions?start_date=${this.daysAgo(0, 5)}&end_date=${new Date().toISOString()}&page_size=20`;
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) return;
      const data = await res.json() as any;
      for (const item of data.transaction_details || []) {
        callback({ op: 'I', table: 'transactions', before: null, after: item.transaction_info, ts: new Date() });
      }
    }, 60000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const def = PAYPAL_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    await this.ensureToken();
    const events: UnifiedChangeEvent[] = [];
    let page = 1;
    const pageSize = 100;
    const startDate = this.daysAgo(30);
    const endDate = new Date().toISOString();

    while (true) {
      const url = `${this.baseUrl}${def.endpoint}?start_date=${startDate}&end_date=${endDate}&page=${page}&page_size=${pageSize}`;
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`PayPal API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data.transaction_details || data.items || [];
      if (items.length === 0) break;

      for (const item of items) {
        const record = item.transaction_info || item;
        const pk = record[def.pk] || record.id;
        events.push(createEvent('S', table, record, null, pk, { source: 'paypal' }));
      }
      const totalPages = data.total_pages || Math.ceil((data.total_items || 0) / pageSize);
      if (page >= totalPages) break;
      page++;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = PAYPAL_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    await this.ensureToken();
    const events: UnifiedChangeEvent[] = [];
    const startDate = watermark || this.daysAgo(1);
    const endDate = new Date().toISOString();
    let page = 1;

    while (true) {
      const url = `${this.baseUrl}${def.endpoint}?start_date=${startDate}&end_date=${endDate}&page=${page}&page_size=100`;
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`PayPal API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data.transaction_details || data.items || [];
      if (items.length === 0) break;

      for (const item of items) {
        const record = item.transaction_info || item;
        const ts = record.transaction_updated_date || record.update_time || new Date().toISOString();
        events.push(createEvent('I', table, record, null, ts, { source: 'paypal' }));
      }
      if (items.length < 100) break;
      page++;
    }
    return events;
  }

  async getPrimaryKey(table: string): Promise<string> { return PAYPAL_TABLES[table]?.pk || 'id'; }

  private async authenticate(): Promise<void> {
    const creds = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new Error(`PayPal OAuth failed: ${res.status}`);
    const data = await res.json() as any;
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
  }

  private async ensureToken(): Promise<void> {
    if (Date.now() >= this.tokenExpiry) await this.authenticate();
  }

  private authHeaders(): Record<string, string> {
    return { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' };
  }

  private daysAgo(days: number, minutes?: number): string {
    const d = new Date();
    if (minutes) d.setMinutes(d.getMinutes() - minutes);
    else d.setDate(d.getDate() - days);
    return d.toISOString();
  }
}

