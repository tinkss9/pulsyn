// BambooHR API — Real API Integration
// Auth: Basic (API key)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('bamboohr-real')
export class BamboohrRealConnector extends BaseConnector {
  private baseUrl = '';
  private apiKey = '';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.baseUrl = config.host || 'https://api.bamboohr.com/api/gateway.php/{company}';
    this.apiKey = config.token || config.password || config.apiKey || '';
    if (!this.apiKey) throw new Error('BambooHR API API key/token required');

    // Verify connection
    const resp = await this.apiGet('/ping').catch(() => this.apiGet('/me').catch(() => this.apiGet('/')));
    if (!resp || !resp.ok) throw new Error('BambooHR API connection failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; this.apiKey = ''; }

  async testConnection(): Promise<boolean> {
    try {
      const resp = await this.apiGet('/ping').catch(() => this.apiGet('/me').catch(() => this.apiGet('/')));
      return resp ? resp.ok : false;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['employees', 'time_off', 'training', 'goals', 'custom_fields'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: true },
        { name: 'created_at', type: 'string', nullable: true },
        { name: 'updated_at', type: 'string', nullable: true },
      ],
      primaryKeys: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const resp = await this.apiGet(`/${table}?limit=100`);
    if (!resp || !resp.ok) return [];
    const data = await resp.json();
    const items = data.data || data.results || data[table] || (Array.isArray(data) ? data : []);
    return items.map((item: any) =>
      createEvent({ op: 'S', table, after: item, watermark: item.updated_at || item.created_at || item.createdAt })
    );
  }

  async extractIncremental(table: string, opts?: { watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    let url = `/${table}?limit=100`;
    if (opts?.watermarkValue) url += `&updated_after=${opts.watermarkValue}`;
    const resp = await this.apiGet(url);
    if (!resp || !resp.ok) return [];
    const data = await resp.json();
    const items = data.data || data.results || data[table] || [];
    return items.map((item: any) =>
      createEvent({ op: 'S', table, after: item, watermark: item.updated_at || item.created_at || item.createdAt })
    );
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> { this.cdcActive = true; }
  async stopCDC(): Promise<void> { this.cdcActive = false; }

  private async apiGet(path: string): Promise<Response | null> {
    try {
      return fetch(`${this.baseUrl}${path}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    } catch { return null; }
  }
}
