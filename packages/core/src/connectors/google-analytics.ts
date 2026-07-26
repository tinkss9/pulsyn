// Google Analytics Connector — web analytics source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let BetaAnalyticsDataClient: any;
try { BetaAnalyticsDataClient = require('@google-analytics/data').BetaAnalyticsDataClient; } catch {}

@registerSource('google-analytics')
export class GoogleAnalyticsConnector extends BaseConnector {
  private client: any = null;
  private propertyId: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'google-analytics', config);
    this.propertyId = (config as any).propertyId || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!BetaAnalyticsDataClient) throw new Error('@google-analytics/data not installed');
    this.client = new BetaAnalyticsDataClient({
      credentials: { client_email: config.user, private_key: config.password },
    });
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'sessions' }],
      });
      return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['reports', 'events', 'pages']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'date', type: 'string', nullable: true },
        { name: 'sessions', type: 'number', nullable: true },
        { name: 'pageviews', type: 'number', nullable: true },
        { name: 'users', type: 'number', nullable: true },
      ],
      primaryKey: ['date'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }, { name: 'totalUsers' }],
    });
    return (response.rows || []).map((row: any) => {
      const data: Record<string, any> = { date: row.dimensionValues?.[0]?.value };
      row.metricValues?.forEach((m: any, i: number) => { data[`metric_${i}`] = parseFloat(m.value); });
      return createEvent({ op: 'S', table, after: data, watermark: data.date });
    });
  }

  async startCDC(): Promise<void> { throw new Error('Google Analytics CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}
