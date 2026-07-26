// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface GoogleAdsConfig extends DatabaseConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  developerToken: string;
  customerId: string;
  loginCustomerId?: string;
}

@registerSource('google-ads')
export class GoogleAdsConnector extends BaseConnector {
  private baseUrl = 'https://googleads.googleapis.com/v16';
  private accessToken = '';
  private developerToken = '';
  private customerId = '';
  private loginCustomerId = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;
  private config_: GoogleAdsConfig | null = null;

  private readonly tableQueries: Record<string, string> = {
    campaigns: 'SELECT campaign.id, campaign.name, campaign.status, campaign.start_date, campaign.end_date, campaign.budget_amount_micros FROM campaign',
    ad_groups: 'SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.campaign FROM ad_group',
    ads: 'SELECT ad_group_ad.ad.id, ad_group_ad.ad.name, ad_group_ad.status, ad_group_ad.ad.type FROM ad_group_ad',
    keywords: 'SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status FROM ad_group_criterion WHERE ad_group_criterion.type = KEYWORD',
    metrics: 'SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, segments.date FROM campaign WHERE segments.date DURING LAST_30_DAYS',
  };

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.config_ = config as GoogleAdsConfig;
    this.developerToken = this.config_.developerToken;
    this.customerId = this.config_.customerId.replace(/-/g, '');
    this.loginCustomerId = this.config_.loginCustomerId?.replace(/-/g, '') || this.customerId;
    await this.refreshAccessToken();
    this.connected = true;
  }

  private async refreshAccessToken(): Promise<void> {
    const cfg = this.config_!;
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
    });
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!res.ok) throw new Error(`Google Ads auth failed: ${res.status}`);
    const data = await res.json() as any;
    this.accessToken = data.access_token;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.gadsFetch('SELECT campaign.id FROM campaign LIMIT 1');
      return res !== null;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return Object.keys(this.tableQueries);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const query = this.tableQueries[table];
    if (!query) throw new Error(`Unknown Google Ads table: ${table}`);
    // Extract field names from GAQL
    const selectMatch = query.match(/SELECT\s+(.+?)\s+FROM/i);
    if (!selectMatch) return { table, columns: [], primaryKeys: [] };
    const fields = selectMatch[1].split(',').map(f => f.trim());
    const columns = fields.map(f => ({
      name: f.split('.').pop() || f, type: 'string', nullable: true, defaultValue: null,
    }));
    return { table, columns, primaryKeys: ['id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const query = `SELECT campaign.id, campaign.name, campaign.status, metrics.impressions, metrics.clicks, segments.date FROM campaign WHERE segments.date = '${this.today()}'`;
        const rows = await this.gadsFetch(query);
        if (!rows) return;
        for (const row of rows) {
          callback({ op: 'U', table: 'metrics', before: null, after: row, ts: new Date() });
        }
      } catch { /* retry */ }
    }, 30000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const query = this.tableQueries[table];
    if (!query) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let pageToken: string | undefined = undefined;

    while (true) {
      const rows = await this.gadsFetch(query, pageToken);
      if (!rows || rows.length === 0) break;

      for (const row of rows) {
        events.push(createEvent({
          op: 'S', table, after: row,
          watermark: null,
          sourceMetadata: { source: 'google-ads', customerId: this.customerId },
        }));
      }

      // Google Ads uses nextPageToken in search responses
      pageToken = (rows as any).__nextPageToken;
      if (!pageToken) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const since = watermark || this.daysAgo(7);
    let query = this.tableQueries[table];
    if (!query) throw new Error(`Unknown table: ${table}`);

    // Add date filter for incremental
    if (query.includes('WHERE')) {
      query += ` AND segments.date >= '${since}'`;
    } else {
      query += ` WHERE segments.date >= '${since}'`;
    }

    const events: UnifiedChangeEvent[] = [];
    const rows = await this.gadsFetch(query);
    if (!rows) return events;

    for (const row of rows) {
      events.push(createEvent({
        op: 'U', table, after: row,
        watermark: this.today(),
        sourceMetadata: { source: 'google-ads', customerId: this.customerId },
      }));
    }
    return events;
  }

  private async gadsFetch(query: string, pageToken?: string): Promise<any[] | null> {
    const url = `${this.baseUrl}/customers/${this.customerId}/googleAds:searchStream`;
    const body: any = { query };
    if (pageToken) body.pageToken = pageToken;

    const res = await this.fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'developer-token': this.developerToken,
        'login-customer-id': this.loginCustomerId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      await this.refreshAccessToken();
      return this.gadsFetch(query, pageToken);
    }
    if (!res.ok) throw new Error(`Google Ads query failed: ${res.status}`);

    const data = await res.json() as any;
    const results: any[] = [];
    for (const batch of data || []) {
      for (const row of batch.results || []) {
        results.push(this.flattenRow(row));
      }
      if (batch.nextPageToken) (results as any).__nextPageToken = batch.nextPageToken;
    }
    return results;
  }

  private flattenRow(row: any): Record<string, any> {
    const flat: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'object' && value !== null) {
        for (const [k2, v2] of Object.entries(value as Record<string, any>)) {
          flat[`${key}_${k2}`] = v2;
        }
      } else {
        flat[key] = value;
      }
    }
    return flat;
  }

  private today(): string { return new Date().toISOString().split('T')[0]; }
  private daysAgo(n: number): string { return new Date(Date.now() - n * 86400000).toISOString().split('T')[0]; }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch(url, init);
      if (res.status === 429) {
        await this.sleep(Math.min(5000 * Math.pow(2, i), 60000));
        continue;
      }
      if (res.status >= 500 && i < retries) {
        await this.sleep(Math.min(1000 * Math.pow(2, i), 30000));
        continue;
      }
      return res;
    }
    throw new Error('Google Ads: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

