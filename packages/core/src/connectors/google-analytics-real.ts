// Google Analytics 4 Connector — Real API Integration
// Auth: Service account JSON or OAuth2
// API: Google Analytics Data API v1beta
// Test: Free GA4 property with service account

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('google-analytics-real')
export class GoogleAnalyticsRealConnector extends BaseConnector {
  private baseUrl = 'https://analyticsdata.googleapis.com/v1beta';
  private accessToken = '';
  private propertyId = '';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.accessToken = config.token || config.password || '';
    this.propertyId = config.database || '';
    if (!this.accessToken) throw new Error('Google Analytics access token required');
    if (!this.propertyId) throw new Error('GA4 Property ID required (e.g., properties/123456789)');

    const resp = await this.apiPost(`/${this.propertyId}:runReport`, {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }],
      limit: 1,
    });
    if (!resp.ok) throw new Error(`GA4 connection failed: HTTP ${resp.status}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; this.accessToken = ''; }

  async testConnection(): Promise<boolean> {
    try {
      const resp = await this.apiPost(`/${this.propertyId}:runReport`, {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }], limit: 1,
      });
      return resp.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['report', 'realtime', 'audience_overview', 'traffic_sources', 'page_views', 'events', 'conversions'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schemas: Record<string, TableSchema> = {
      report: {
        table: 'report', primaryKeys: ['date'],
        columns: [
          { name: 'date', type: 'string', nullable: false, primaryKey: true },
          { name: 'sessions', type: 'number', nullable: true },
          { name: 'totalUsers', type: 'number', nullable: true },
          { name: 'screenPageViews', type: 'number', nullable: true },
          { name: 'bounceRate', type: 'number', nullable: true },
          { name: 'averageSessionDuration', type: 'number', nullable: true },
        ],
      },
      traffic_sources: {
        table: 'traffic_sources', primaryKeys: ['date'],
        columns: [
          { name: 'date', type: 'string', nullable: false, primaryKey: true },
          { name: 'sessionSource', type: 'string', nullable: true },
          { name: 'sessionMedium', type: 'string', nullable: true },
          { name: 'sessions', type: 'number', nullable: true },
          { name: 'totalUsers', type: 'number', nullable: true },
        ],
      },
      page_views: {
        table: 'page_views', primaryKeys: ['date'],
        columns: [
          { name: 'date', type: 'string', nullable: false, primaryKey: true },
          { name: 'pagePath', type: 'string', nullable: true },
          { name: 'pageTitle', type: 'string', nullable: true },
          { name: 'screenPageViews', type: 'number', nullable: true },
        ],
      },
    };
    return schemas[table] || schemas.report;
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const reportConfig = this.getReportConfig(table);
    const resp = await this.apiPost(`/${this.propertyId}:runReport`, reportConfig);
    if (!resp.ok) return [];

    const data = await resp.json();
    const rows = data.rows || [];
    const dims = (data.dimensionHeaders || []).map((h: any) => h.name);
    const metrics = (data.metricHeaders || []).map((h: any) => h.name);

    return rows.map((row: any) => {
      const record: Record<string, any> = {};
      (row.dimensionValues || []).forEach((v: any, i: number) => { record[dims[i]] = v.value; });
      (row.metricValues || []).forEach((v: any, i: number) => { record[metrics[i]] = parseFloat(v.value) || v.value; });
      return createEvent({ op: 'S', table, after: record, watermark: record.date });
    });
  }

  async extractIncremental(table: string, opts?: { watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    const reportConfig = this.getReportConfig(table);
    if (opts?.watermarkValue) {
      reportConfig.dateRanges = [{ startDate: opts.watermarkValue, endDate: 'today' }];
    }
    return this.extractFull(table);
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> { this.cdcActive = true; }
  async stopCDC(): Promise<void> { this.cdcActive = false; }

  private getReportConfig(table: string): any {
    const configs: Record<string, any> = {
      report: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }, { name: 'bounceRate' }, { name: 'averageSessionDuration' }],
        limit: 100,
      },
      traffic_sources: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }, { name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
        limit: 100,
      },
      page_views: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }, { name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        limit: 100,
      },
    };
    return configs[table] || configs.report;
  }

  private async apiPost(path: string, body: any): Promise<Response> {
    return fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
}
