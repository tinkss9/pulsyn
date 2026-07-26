// @ts-nocheck
// FreshBooks connector — OAuth2, /accounting/account/{id}/{resource}
// CDC via updated_since, page/per_page pagination

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface FreshBooksConfig extends DatabaseConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accountId: string;
}

const FB_TABLES: Record<string, { resource: string; listKey: string; pk: string; columns: any[] }> = {
  invoices: {
    resource: 'invoices/invoices',
    listKey: 'invoices',
    pk: 'invoiceid',
    columns: [
      { name: 'invoiceid', type: 'integer', nullable: false, defaultValue: null },
      { name: 'invoice_number', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'customerid', type: 'integer', nullable: false, defaultValue: null },
      { name: 'amount_total', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'amount_outstanding', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'currency_code', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'integer', nullable: false, defaultValue: null },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'updated', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  clients: {
    resource: 'users/clients',
    listKey: 'clients',
    pk: 'id',
    columns: [
      { name: 'id', type: 'integer', nullable: false, defaultValue: null },
      { name: 'fname', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'lname', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'organization', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'email', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'currency_code', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'updated', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  expenses: {
    resource: 'expenses/expenses',
    listKey: 'expenses',
    pk: 'id',
    columns: [
      { name: 'id', type: 'integer', nullable: false, defaultValue: null },
      { name: 'categoryid', type: 'integer', nullable: true, defaultValue: null },
      { name: 'amount_amount', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'amount_code', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'vendor', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'date', type: 'date', nullable: false, defaultValue: null },
      { name: 'status', type: 'integer', nullable: false, defaultValue: null },
      { name: 'updated', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  payments: {
    resource: 'payments/payments',
    listKey: 'payments',
    pk: 'id',
    columns: [
      { name: 'id', type: 'integer', nullable: false, defaultValue: null },
      { name: 'invoiceid', type: 'integer', nullable: false, defaultValue: null },
      { name: 'amount_amount', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'amount_code', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'type', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'date', type: 'date', nullable: false, defaultValue: null },
      { name: 'updated', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
};

@registerSource('freshbooks')
export class FreshBooksConnector extends BaseConnector {
  private accessToken = '';
  private refreshToken = '';
  private clientId = '';
  private clientSecret = '';
  private accountId = '';
  private baseUrl = 'https://api.freshbooks.com';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    const fc = config as FreshBooksConfig;
    this.clientId = fc.clientId;
    this.clientSecret = fc.clientSecret;
    this.refreshToken = fc.refreshToken;
    this.accountId = fc.accountId;
    this.config = config;
    await this.authenticate();
    this.connected = true;
  }

  async disconnect(): Promise<void> { await this.stopCDC(); this.connected = false; }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/api/v1/users/me`, { headers: this.authHeaders() });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return Object.keys(FB_TABLES); }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = FB_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    return { table, columns: def.columns, primaryKeys: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      const since = new Date(Date.now() - 60000).toISOString();
      for (const [table, def] of Object.entries(FB_TABLES)) {
        const url = `${this.baseUrl}/accounting/account/${this.accountId}/${def.resource}?updated_since=${since}&per_page=20`;
        const res = await fetch(url, { headers: this.authHeaders() });
        if (!res.ok) continue;
        const data = await res.json() as any;
        const items = data.response?.result?.[def.listKey] || [];
        for (const item of items) {
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
    const def = FB_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const url = `${this.baseUrl}/accounting/account/${this.accountId}/${def.resource}?page=${page}&per_page=${perPage}`;
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`FreshBooks API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data.response?.result?.[def.listKey] || [];
      if (items.length === 0) break;

      for (const item of items) {
        const pk = item[def.pk]?.toString() || item.id?.toString();
        events.push(createEvent('S', table, item, null, pk, { source: 'freshbooks' }));
      }
      const totalPages = data.response?.result?.pages || 1;
      if (page >= totalPages) break;
      page++;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = FB_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString();
    let page = 1;

    while (true) {
      const url = `${this.baseUrl}/accounting/account/${this.accountId}/${def.resource}?updated_since=${since}&page=${page}&per_page=100`;
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`FreshBooks API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data.response?.result?.[def.listKey] || [];
      if (items.length === 0) break;

      for (const item of items) {
        const ts = item.updated || new Date().toISOString();
        events.push(createEvent('I', table, item, null, ts, { source: 'freshbooks' }));
      }
      const totalPages = data.response?.result?.pages || 1;
      if (page >= totalPages) break;
      page++;
    }
    return events;
  }

  async getPrimaryKey(table: string): Promise<string> { return FB_TABLES[table]?.pk || 'id'; }

  private async authenticate(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/auth/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token', client_id: this.clientId,
        client_secret: this.clientSecret, refresh_token: this.refreshToken,
      }),
    });
    if (!res.ok) throw new Error(`FreshBooks OAuth failed: ${res.status}`);
    const data = await res.json() as any;
    this.accessToken = data.access_token;
    if (data.refresh_token) this.refreshToken = data.refresh_token;
  }

  private authHeaders(): Record<string, string> {
    return { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' };
  }
}

