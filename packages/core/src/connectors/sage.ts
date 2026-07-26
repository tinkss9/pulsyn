// @ts-nocheck
// Sage connector — OAuth2, /accounts/v3/{resource}
// CDC via updated_from parameter, Link header pagination

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface SageConfig extends DatabaseConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  baseUrl?: string;
}

const SAGE_TABLES: Record<string, { resource: string; pk: string; columns: any[] }> = {
  ledger_accounts: {
    resource: 'ledger_accounts',
    pk: 'id',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'displayed_as', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'nominal_code', type: 'integer', nullable: false, defaultValue: null },
      { name: 'ledger_account_type_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'balance', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'updated_at', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  contacts: {
    resource: 'contacts',
    pk: 'id',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'displayed_as', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'contact_type_ids', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'email', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'main_address_id', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'updated_at', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  sales_invoices: {
    resource: 'sales_invoices',
    pk: 'id',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'displayed_as', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'contact_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'total_amount', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'outstanding_amount', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'status_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'date', type: 'date', nullable: false, defaultValue: null },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'updated_at', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  bank_transactions: {
    resource: 'bank_transactions',
    pk: 'id',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'displayed_as', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'transaction_type_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'amount', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'bank_account_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'date', type: 'date', nullable: false, defaultValue: null },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'updated_at', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
};

@registerSource('sage')
export class SageConnector extends BaseConnector {
  private accessToken = '';
  private refreshToken = '';
  private clientId = '';
  private clientSecret = '';
  private baseUrl = 'https://api.accounting.sage.com/v3.1';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    const sc = config as SageConfig;
    this.clientId = sc.clientId;
    this.clientSecret = sc.clientSecret;
    this.refreshToken = sc.refreshToken;
    this.baseUrl = sc.baseUrl || 'https://api.accounting.sage.com/v3.1';
    this.config = config;
    await this.authenticate();
    this.connected = true;
  }

  async disconnect(): Promise<void> { await this.stopCDC(); this.connected = false; }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/business`, { headers: this.authHeaders() });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return Object.keys(SAGE_TABLES); }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = SAGE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    return { table, columns: def.columns, primaryKeys: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      const since = new Date(Date.now() - 60000).toISOString();
      for (const [table, def] of Object.entries(SAGE_TABLES)) {
        const res = await fetch(`${this.baseUrl}/${def.resource}?updated_from=${since}`, { headers: this.authHeaders() });
        if (!res.ok) continue;
        const data = await res.json() as any;
        for (const item of data.$items || []) {
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
    const def = SAGE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let url: string | null = `${this.baseUrl}/${def.resource}?items_per_page=200`;

    while (url) {
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`Sage API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data.$items || [];
      if (items.length === 0) break;

      for (const item of items) {
        events.push(createEvent('S', table, item, null, item.id, { source: 'sage' }));
      }
      url = this.parseNextLink(res.headers.get('Link'));
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = SAGE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString();
    let url: string | null = `${this.baseUrl}/${def.resource}?updated_from=${since}&items_per_page=200`;

    while (url) {
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`Sage API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data.$items || [];
      if (items.length === 0) break;

      for (const item of items) {
        const ts = item.updated_at || new Date().toISOString();
        events.push(createEvent('I', table, item, null, ts, { source: 'sage' }));
      }
      url = this.parseNextLink(res.headers.get('Link'));
    }
    return events;
  }

  async getPrimaryKey(table: string): Promise<string> { return SAGE_TABLES[table]?.pk || 'id'; }

  private async authenticate(): Promise<void> {
    const res = await fetch('https://oauth.accounting.sage.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId, client_secret: this.clientSecret,
        refresh_token: this.refreshToken, grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) throw new Error(`Sage OAuth failed: ${res.status}`);
    const data = await res.json() as any;
    this.accessToken = data.access_token;
    if (data.refresh_token) this.refreshToken = data.refresh_token;
  }

  private authHeaders(): Record<string, string> {
    return { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' };
  }

  private parseNextLink(header: string | null): string | null {
    if (!header) return null;
    const match = header.match(/<([^>]+)>;\s*rel="next"/);
    return match ? match[1] : null;
  }
}

