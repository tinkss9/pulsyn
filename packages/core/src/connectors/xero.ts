// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface XeroConfig extends DatabaseConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  tenantId: string;
}

@registerSource('xero')
export class XeroConnector extends BaseConnector {
  private baseUrl = 'https://api.xero.com/api.xro/2.0';
  private accessToken = '';
  private tenantId = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;
  private config_: XeroConfig | null = null;

  private readonly resources = ['Invoices', 'Contacts', 'Accounts', 'BankTransactions', 'Payments', 'ManualJournals', 'Items', 'CreditNotes'];

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.config_ = config as XeroConfig;
    this.tenantId = this.config_.tenantId;
    await this.refreshAccessToken();
    this.connected = true;
  }

  private async refreshAccessToken(): Promise<void> {
    const cfg = this.config_!;
    const creds = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64');
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: cfg.refreshToken,
    });
    const res = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!res.ok) throw new Error(`Xero auth failed: ${res.status}`);
    const data = await res.json() as any;
    this.accessToken = data.access_token;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.xeroFetch('/Organisation');
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return [...this.resources];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const res = await this.xeroFetch(`/${table}?page=1`);
    if (!res.ok) return { table, columns: [], primaryKeys: [`${table}ID`] };
    const data = await res.json() as any;
    const items = data[table] || [];
    const sample = items[0];
    if (!sample) return { table, columns: [], primaryKeys: [`${table}ID`] };
    const columns = Object.entries(sample).map(([name, value]) => ({
      name, type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
      nullable: value === null, defaultValue: null,
    }));
    return { table, columns, primaryKeys: [`${table.replace(/s$/, '')}ID`] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const watermarks: Record<string, string> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        for (const resource of this.resources.slice(0, 4)) {
          const since = watermarks[resource] || new Date(Date.now() - 60000).toUTCString();
          const res = await this.xeroFetch(`/${resource}`, {
            headers: { 'If-Modified-Since': since },
          });
          if (res.status === 304 || !res.ok) continue;
          const data = await res.json() as any;
          for (const item of data[resource] || []) {
            callback({ op: 'U', table: resource, before: null, after: item, ts: new Date() });
          }
          watermarks[resource] = new Date().toUTCString();
        }
      } catch { /* retry */ }
    }, 15000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    let page = 1;

    while (true) {
      const res = await this.xeroFetch(`/${table}?page=${page}`);
      if (!res.ok) throw new Error(`Xero extract failed: ${res.status}`);
      const data = await res.json() as any;
      const items = data[table] || [];

      for (const item of items) {
        const pk = item[`${table.replace(/s$/, '')}ID`] || item.ContactID || item.AccountID;
        events.push(createEvent({
          op: 'S', table, after: item,
          watermark: pk || null,
          sourceMetadata: { source: 'xero', tenantId: this.tenantId },
        }));
      }

      if (items.length < 100) break;
      page++;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toUTCString();
    let page = 1;

    while (true) {
      const res = await this.xeroFetch(`/${table}?page=${page}`, {
        headers: { 'If-Modified-Since': since },
      });
      if (res.status === 304) break;
      if (!res.ok) throw new Error(`Xero incremental failed: ${res.status}`);
      const data = await res.json() as any;
      const items = data[table] || [];

      for (const item of items) {
        events.push(createEvent({
          op: 'U', table, after: item,
          watermark: item.UpdatedDateUTC || new Date().toISOString(),
          sourceMetadata: { source: 'xero', tenantId: this.tenantId },
        }));
      }

      if (items.length < 100) break;
      page++;
    }
    return events;
  }

  private async xeroFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Xero-Tenant-Id': this.tenantId,
      'Accept': 'application/json',
      ...(init?.headers as Record<string, string> || {}),
    };
    const res = await this.fetchWithRetry(url, { ...init, headers });
    if (res.status === 401) {
      await this.refreshAccessToken();
      return this.fetchWithRetry(url, { ...init, headers: { ...headers, 'Authorization': `Bearer ${this.accessToken}` } });
    }
    return res;
  }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch(url, init);
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '60', 10);
        await this.sleep(retryAfter * 1000);
        continue;
      }
      if (res.status >= 500 && i < retries) {
        await this.sleep(Math.min(1000 * Math.pow(2, i), 30000));
        continue;
      }
      return res;
    }
    throw new Error('Xero: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

