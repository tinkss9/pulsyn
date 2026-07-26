// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface QuickBooksConfig extends DatabaseConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  realmId: string;
  sandbox?: boolean;
}

@registerSource('quickbooks')
export class QuickBooksConnector extends BaseConnector {
  private baseUrl = '';
  private accessToken = '';
  private realmId = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;
  private config_: QuickBooksConfig | null = null;

  private readonly entities = ['Customer', 'Invoice', 'Payment', 'Bill', 'Vendor', 'Account', 'Item', 'Estimate', 'PurchaseOrder', 'JournalEntry'];

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.config_ = config as QuickBooksConfig;
    this.realmId = this.config_.realmId;
    this.baseUrl = this.config_.sandbox
      ? `https://sandbox-quickbooks.api.intuit.com/v3/company/${this.realmId}`
      : `https://quickbooks.api.intuit.com/v3/company/${this.realmId}`;
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
    const res = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!res.ok) throw new Error(`QuickBooks auth failed: ${res.status}`);
    const data = await res.json() as any;
    this.accessToken = data.access_token;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.qbFetch('/query?query=SELECT COUNT(*) FROM Customer&minorversion=65');
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return [...this.entities];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const res = await this.qbFetch(`/query?query=${encodeURIComponent(`SELECT * FROM ${table} MAXRESULTS 1`)}&minorversion=65`);
    if (!res.ok) return { table, columns: [], primaryKeys: ['Id'] };
    const data = await res.json() as any;
    const items = data.QueryResponse?.[table] || [];
    const sample = items[0];
    if (!sample) return { table, columns: [], primaryKeys: ['Id'] };
    const columns = Object.entries(sample).map(([name, value]) => ({
      name, type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
      nullable: value === null, defaultValue: null,
    }));
    return { table, columns, primaryKeys: ['Id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const watermarks: Record<string, string> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const since = watermarks['cdc'] || new Date(Date.now() - 60000).toISOString();
        const entities = this.entities.join(',');
        const res = await this.qbFetch(`/cdc?changedSince=${since}&entities=${entities}&minorversion=65`);
        if (!res.ok) return;
        const data = await res.json() as any;
        const cdcResponse = data.CDCResponse?.[0]?.QueryResponse || [];
        for (const qr of cdcResponse) {
          for (const [entity, items] of Object.entries(qr)) {
            if (!Array.isArray(items)) continue;
            for (const item of items) {
              const op = (item as any).status === 'Deleted' ? 'D' : 'U';
              callback({ op, table: entity, before: null, after: item, ts: new Date() });
            }
          }
        }
        watermarks['cdc'] = new Date().toISOString();
      } catch { /* retry */ }
    }, 15000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    let startPosition = 1;
    const maxResults = 1000;

    while (true) {
      const query = `SELECT * FROM ${table} STARTPOSITION ${startPosition} MAXRESULTS ${maxResults}`;
      const res = await this.qbFetch(`/query?query=${encodeURIComponent(query)}&minorversion=65`);
      if (!res.ok) throw new Error(`QuickBooks extract failed: ${res.status}`);
      const data = await res.json() as any;
      const items = data.QueryResponse?.[table] || [];

      for (const item of items) {
        events.push(createEvent({
          op: 'S', table, after: item,
          watermark: item.Id || null,
          sourceMetadata: { source: 'quickbooks', realmId: this.realmId },
        }));
      }

      if (items.length < maxResults) break;
      startPosition += items.length;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString();
    let startPosition = 1;
    const maxResults = 1000;

    while (true) {
      const query = `SELECT * FROM ${table} WHERE MetaData.LastUpdatedTime > '${since}' STARTPOSITION ${startPosition} MAXRESULTS ${maxResults}`;
      const res = await this.qbFetch(`/query?query=${encodeURIComponent(query)}&minorversion=65`);
      if (!res.ok) throw new Error(`QuickBooks incremental failed: ${res.status}`);
      const data = await res.json() as any;
      const items = data.QueryResponse?.[table] || [];

      for (const item of items) {
        events.push(createEvent({
          op: 'U', table, after: item,
          watermark: item.MetaData?.LastUpdatedTime || new Date().toISOString(),
          sourceMetadata: { source: 'quickbooks', realmId: this.realmId },
        }));
      }

      if (items.length < maxResults) break;
      startPosition += items.length;
    }
    return events;
  }

  private async qbFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
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
    throw new Error('QuickBooks: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

