// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface GoogleAnalyticsConfig extends DatabaseConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  propertyId: string;
}

@registerSource('google-analytics')
export class GoogleAnalyticsConnector extends BaseConnector {
  private baseUrl = 'https://analyticsdata.googleapis.com/v1beta';
  private accessToken = '';
  private propertyId = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;
  private config_: GoogleAnalyticsConfig | null = null;

  private readonly reportTypes: Record<string, { dimensions: string[]; metrics: string[] }> = {
    page_views: { dimensions: ['pagePath', 'pageTitle', 'date'], metrics: ['screenPageViews', 'totalUsers', 'sessions'] },
    traffic_sources: { dimensions: ['sessionSource', 'sessionMedium', 'date'], metrics: ['sessions', 'totalUsers', 'newUsers'] },
    events: { dimensions: ['eventName', 'date'], metrics: ['eventCount', 'totalUsers'] },
    demographics: { dimensions: ['country', 'city', 'date'], metrics: ['totalUsers', 'sessions', 'screenPageViews'] },
    devices: { dimensions: ['deviceCategory', 'operatingSystem', 'browser', 'date'], metrics: ['totalUsers', 'sessions'] },
  };

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.config_ = config as GoogleAnalyticsConfig;
    this.propertyId = this.config_.propertyId;
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
    if (!res.ok) throw new Error(`Google Analytics auth failed: ${res.status}`);
    const data = await res.json() as any;
    this.accessToken = data.access_token;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.gaFetch(`/properties/${this.propertyId}/metadata`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return Object.keys(this.reportTypes);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const report = this.reportTypes[table];
    if (!report) throw new Error(`Unknown GA4 report: ${table}`);
    const columns = [
      ...report.dimensions.map(d => ({ name: d, type: 'string', nullable: true, defaultValue: null })),
      ...report.metrics.map(m => ({ name: m, type: 'number', nullable: true, defaultValue: null })),
    ];
    return { table, columns, primaryKeys: report.dimensions };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const today = this.today();
        for (const [table, report] of Object.entries(this.reportTypes)) {
          const rows = await this.runReport(report.dimensions, report.metrics, today, today);
          for (const row of rows) {
            callback({ op: 'U', table, before: null, after: row, ts: new Date() });
          }
        }
      } catch { /* retry */ }
    }, 60000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const report = this.reportTypes[table];
    if (!report) throw new Error(`Unknown report: ${table}`);

    const startDate = this.daysAgo(90);
    const endDate = this.today();
    const events: UnifiedChangeEvent[] = [];
    let offset = 0;
    const limit = 10000;

    while (true) {
      const rows = await this.runReport(report.dimensions, report.metrics, startDate, endDate, limit, offset);
      for (const row of rows) {
        events.push(createEvent({
          op: 'S', table, after: row,
          watermark: row.date || null,
          sourceMetadata: { source: 'google-analytics', propertyId: this.propertyId },
        }));
      }
      if (rows.length < limit) break;
      offset += rows.length;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const report = this.reportTypes[table];
    if (!report) throw new Error(`Unknown report: ${table}`);

    const startDate = watermark || this.daysAgo(7);
    const endDate = this.today();
    const events: UnifiedChangeEvent[] = [];
    let offset = 0;
    const limit = 10000;

    while (true) {
      const rows = await this.runReport(report.dimensions, report.metrics, startDate, endDate, limit, offset);
      for (const row of rows) {
        events.push(createEvent({
          op: 'U', table, after: row,
          watermark: this.today(),
          sourceMetadata: { source: 'google-analytics', propertyId: this.propertyId },
        }));
      }
      if (rows.length < limit) break;
      offset += rows.length;
    }
    return events;
  }

  private async runReport(dimensions: string[], metrics: string[], startDate: string, endDate: string, limit = 10000, offset = 0): Promise<Record<string, any>[]> {
    const body = {
      dateRanges: [{ startDate, endDate }],
      dimensions: dimensions.map(d => ({ name: d })),
      metrics: metrics.map(m => ({ name: m })),
      limit,
      offset,
    };

    const res = await this.gaFetch(`/properties/${this.propertyId}:runReport`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      await this.refreshAccessToken();
      return this.runReport(dimensions, metrics, startDate, endDate, limit, offset);
    }
    if (!res.ok) throw new Error(`GA4 report failed: ${res.status}`);

    const data = await res.json() as any;
    const dimHeaders = (data.dimensionHeaders || []).map((h: any) => h.name);
    const metHeaders = (data.metricHeaders || []).map((h: any) => h.name);
    const rows: Record<string, any>[] = [];

    for (const row of data.rows || []) {
      const record: Record<string, any> = {};
      (row.dimensionValues || []).forEach((v: any, i: number) => { record[dimHeaders[i]] = v.value; });
      (row.metricValues || []).forEach((v: any, i: number) => { record[metHeaders[i]] = parseFloat(v.value) || v.value; });
      rows.push(record);
    }
    return rows;
  }

  private today(): string { return new Date().toISOString().split('T')[0]; }
  private daysAgo(n: number): string { return new Date(Date.now() - n * 86400000).toISOString().split('T')[0]; }

  private async gaFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string> || {}),
    };
    return this.fetchWithRetry(url, { ...init, headers });
  }

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
    throw new Error('Google Analytics: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

