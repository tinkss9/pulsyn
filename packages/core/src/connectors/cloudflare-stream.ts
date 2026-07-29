import { registerSource } from '../registry';
import { BaseConnector } from '../base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../../types';
import { UnifiedChangeEvent } from '../../events';

@registerSource('cloudflare-stream')
export class CloudflareStreamConnector extends BaseConnector {
  private baseUrl: string;
  private apiKey: string;

  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cloudflare-stream', 'cloudflare-stream', config);
    this.baseUrl = config.host || '';
    this.apiKey = config.password || '';
  }

  async connect(config?: DatabaseConfig): Promise<void> {
    const cfg = config || this.config;
    this.baseUrl = cfg.host || this.baseUrl;
    this.apiKey = cfg.password || this.apiKey;
    const resp = await fetch(this.baseUrl + '/health', {
      headers: { 'Authorization': 'Bearer ' + this.apiKey }
    });
    if (!resp.ok) throw new Error('Connection failed: ' + resp.status);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const resp = await fetch(this.baseUrl + '/health', {
        headers: { 'Authorization': 'Bearer ' + this.apiKey }
      });
      return resp.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const resp = await fetch(this.baseUrl + '/resources', {
      headers: { 'Authorization': 'Bearer ' + this.apiKey }
    });
    const data = await resp.json();
    return Array.isArray(data) ? data.map((r: Record<string, unknown>) => String(r.name || r.id)) : [];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const resp = await fetch(this.baseUrl + '/resources/' + table + '/schema', {
      headers: { 'Authorization': 'Bearer ' + this.apiKey }
    });
    return await resp.json();
  }

  async extractFull(table: string, opts?: { limit?: number; offset?: number }): Promise<UnifiedChangeEvent[]> {
    const params = new URLSearchParams();
    if (opts?.limit) params.set('limit', String(opts.limit));
    if (opts?.offset) params.set('offset', String(opts.offset));
    const resp = await fetch(this.baseUrl + '/' + table + '?' + params, {
      headers: { 'Authorization': 'Bearer ' + this.apiKey }
    });
    const data = await resp.json();
    const items = Array.isArray(data) ? data : data.data || data.items || [];
    return items.map((item: Record<string, unknown>) => ({
      op: 'S' as const, table, after: item, before: null,
      ts: new Date(), watermark: null, sourceMetadata: { connector: 'cloudflare-stream' }
    }));
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    const params = new URLSearchParams();
    if (opts?.watermarkColumn && opts?.watermarkValue) {
      params.set('filter', opts.watermarkColumn + '>:' + opts.watermarkValue);
    }
    const resp = await fetch(this.baseUrl + '/' + table + '?' + params, {
      headers: { 'Authorization': 'Bearer ' + this.apiKey }
    });
    const data = await resp.json();
    const items = Array.isArray(data) ? data : data.data || data.items || [];
    return items.map((item: Record<string, unknown>) => ({
      op: 'I' as const, table, after: item, before: null,
      ts: new Date(), watermark: null, sourceMetadata: { connector: 'cloudflare-stream' }
    }));
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    // REST API polling CDC: poll every 5s
  }

  async stopCDC(): Promise<void> {}
}
