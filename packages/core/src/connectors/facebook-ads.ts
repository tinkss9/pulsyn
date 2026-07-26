// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface FacebookAdsConfig extends DatabaseConfig {
  accessToken: string;
  adAccountId: string;
  apiVersion?: string;
}

@registerSource('facebook-ads')
export class FacebookAdsConnector extends BaseConnector {
  private baseUrl = 'https://graph.facebook.com';
  private accessToken = '';
  private adAccountId = '';
  private apiVersion = 'v18.0';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  private readonly resources = ['campaigns', 'adsets', 'ads', 'insights', 'adcreatives'];

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const fc = config as FacebookAdsConfig;
    this.accessToken = fc.accessToken;
    this.adAccountId = fc.adAccountId.startsWith('act_') ? fc.adAccountId : `act_${fc.adAccountId}`;
    this.apiVersion = fc.apiVersion || 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

    const ok = await this.testConnection();
    if (!ok) throw new Error('Facebook Ads connection test failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.fbFetch(`/${this.adAccountId}?fields=name,account_status`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return [...this.resources];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const fieldsMap: Record<string, string[]> = {
      campaigns: ['id', 'name', 'status', 'objective', 'daily_budget', 'lifetime_budget', 'created_time', 'updated_time'],
      adsets: ['id', 'name', 'status', 'campaign_id', 'daily_budget', 'targeting', 'created_time', 'updated_time'],
      ads: ['id', 'name', 'status', 'adset_id', 'campaign_id', 'creative', 'created_time', 'updated_time'],
      insights: ['campaign_id', 'campaign_name', 'impressions', 'clicks', 'spend', 'cpc', 'cpm', 'reach', 'date_start', 'date_stop'],
      adcreatives: ['id', 'name', 'body', 'title', 'image_url', 'link_url'],
    };
    const fields = fieldsMap[table] || ['id', 'name'];
    const columns = fields.map(name => ({ name, type: 'string', nullable: true, defaultValue: null }));
    return { table, columns, primaryKeys: ['id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const watermarks: Record<string, string> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const since = watermarks['insights'] || this.daysAgo(1);
        const res = await this.fbFetch(
          `/${this.adAccountId}/insights?fields=campaign_id,impressions,clicks,spend&time_range={"since":"${since}","until":"${this.today()}"}&level=campaign&limit=100`
        );
        if (!res.ok) return;
        const data = await res.json() as any;
        for (const item of data.data || []) {
          callback({ op: 'U', table: 'insights', before: null, after: item, ts: new Date() });
        }
        watermarks['insights'] = this.today();
      } catch { /* retry */ }
    }, 30000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const fields = await this.getFieldsForTable(table);

    if (table === 'insights') {
      return this.extractInsights(null);
    }

    let url: string | null = `/${this.adAccountId}/${table}?fields=${fields}&limit=100`;

    while (url) {
      const res = await this.fbFetch(url);
      if (!res.ok) throw new Error(`Facebook Ads extract failed: ${res.status}`);
      const data = await res.json() as any;

      for (const item of data.data || []) {
        events.push(createEvent({
          op: 'S', table, after: item,
          watermark: item.id || null,
          sourceMetadata: { source: 'facebook-ads', adAccountId: this.adAccountId },
        }));
      }

      url = data.paging?.next ? this.extractPath(data.paging.next) : null;
      if ((data.data || []).length === 0) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (table === 'insights') return this.extractInsights(watermark);

    const events: UnifiedChangeEvent[] = [];
    const since = watermark || this.daysAgo(7);
    const fields = await this.getFieldsForTable(table);
    let url: string | null = `/${this.adAccountId}/${table}?fields=${fields}&filtering=[{"field":"updated_time","operator":"GREATER_THAN","value":"${since}"}]&limit=100`;

    while (url) {
      const res = await this.fbFetch(url);
      if (!res.ok) throw new Error(`Facebook Ads incremental failed: ${res.status}`);
      const data = await res.json() as any;

      for (const item of data.data || []) {
        events.push(createEvent({
          op: 'U', table, after: item,
          watermark: item.updated_time || this.today(),
          sourceMetadata: { source: 'facebook-ads', adAccountId: this.adAccountId },
        }));
      }

      url = data.paging?.next ? this.extractPath(data.paging.next) : null;
      if ((data.data || []).length === 0) break;
    }
    return events;
  }

  private async extractInsights(watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || this.daysAgo(30);
    let url: string | null = `/${this.adAccountId}/insights?fields=campaign_id,campaign_name,impressions,clicks,spend,cpc,cpm,reach&time_range={"since":"${since}","until":"${this.today()}"}&level=campaign&time_increment=1&limit=100`;

    while (url) {
      const res = await this.fbFetch(url);
      if (!res.ok) throw new Error(`Insights extract failed: ${res.status}`);
      const data = await res.json() as any;

      for (const item of data.data || []) {
        events.push(createEvent({
          op: 'S', table: 'insights', after: item,
          watermark: item.date_start || null,
          sourceMetadata: { source: 'facebook-ads' },
        }));
      }

      url = data.paging?.next ? this.extractPath(data.paging.next) : null;
      if ((data.data || []).length === 0) break;
    }
    return events;
  }

  private async getFieldsForTable(table: string): Promise<string> {
    const map: Record<string, string> = {
      campaigns: 'id,name,status,objective,daily_budget,lifetime_budget,created_time,updated_time',
      adsets: 'id,name,status,campaign_id,daily_budget,targeting,created_time,updated_time',
      ads: 'id,name,status,adset_id,campaign_id,creative,created_time,updated_time',
      adcreatives: 'id,name,body,title,image_url,link_url',
      insights: 'campaign_id,impressions,clicks,spend',
    };
    return map[table] || 'id,name';
  }

  private extractPath(fullUrl: string): string {
    try {
      const parsed = new URL(fullUrl);
      return parsed.pathname.replace(`/${this.apiVersion}`, '') + parsed.search;
    } catch { return fullUrl; }
  }

  private today(): string { return new Date().toISOString().split('T')[0]; }
  private daysAgo(n: number): string { return new Date(Date.now() - n * 86400000).toISOString().split('T')[0]; }

  private async fbFetch(path: string, init?: RequestInit): Promise<Response> {
    const separator = path.includes('?') ? '&' : '?';
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}${separator}access_token=${this.accessToken}`;
    return this.fetchWithRetry(url, init);
  }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch(url, init);
      if (res.status === 429) {
        const waitMs = Math.min(60000 * Math.pow(2, i), 300000);
        await this.sleep(waitMs);
        continue;
      }
      if (res.status >= 500 && i < retries) {
        await this.sleep(Math.min(5000 * Math.pow(2, i), 60000));
        continue;
      }
      return res;
    }
    throw new Error('Facebook Ads: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

