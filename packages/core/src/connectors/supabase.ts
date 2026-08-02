// @ts-nocheck
import { registerSource } from './registry';
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent } from '../events';

@registerSource('supabase')
export class SupabaseConnector extends BaseConnector {
  private baseUrl: string;
  private apiKey: string;
  private specCache: any = null;

  constructor(id: string, nameOrConfig: any, engineOrConfig?: any, config?: DatabaseConfig) {
    // Support both 2-arg (id, config) and 4-arg (id, name, engine, config) forms
    const actualConfig = config || nameOrConfig;
    super(id, 'supabase', 'supabase', actualConfig);
    this.baseUrl = actualConfig?.host || '';
    this.apiKey = actualConfig?.password || '';
  }

  private headers() {
    return { 'Authorization': 'Bearer ' + this.apiKey, 'apikey': this.apiKey };
  }

  private async getSpec(): Promise<any> {
    if (this.specCache) return this.specCache;
    const resp = await fetch(this.baseUrl + '/rest/v1/', { headers: this.headers() });
    this.specCache = await resp.json();
    return this.specCache;
  }

  async connect(config?: DatabaseConfig): Promise<void> {
    const cfg = config || this.config;
    this.baseUrl = cfg.host || this.baseUrl;
    this.apiKey = cfg.password || this.apiKey;
    this.specCache = null;
    const resp = await fetch(this.baseUrl + '/rest/v1/', { headers: this.headers() });
    if (!resp.ok) throw new Error('Connection failed: ' + resp.status);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.specCache = null;
  }

  async testConnection(): Promise<boolean> {
    try {
      const resp = await fetch(this.baseUrl + '/rest/v1/', { headers: this.headers() });
      return resp.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    if (!this.connected) throw new Error('Not connected');
    const data = await this.getSpec();
    const paths = data.paths || {};
    return Object.keys(paths)
      .filter(p => p.startsWith('/') && !p.startsWith('/rpc/') && p.length > 1)
      .map(p => p.substring(1))
      .filter(p => !p.startsWith('_') && p.length > 0);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.connected) throw new Error('Not connected');
    const data = await this.getSpec();
    const tableDef = data.definitions?.[table];
    if (!tableDef) return { table, columns: [], primaryKeys: [] };
    
    const columns = Object.entries(tableDef.properties || {}).map(([name, prop]: [string, any]) => ({
      name,
      type: prop.format || prop.type || 'unknown',
      nullable: !tableDef.required?.includes(name),
      primaryKey: name === 'id',
    }));
    return { table, columns, primaryKeys: columns.filter(c => c.primaryKey).map(c => c.name) };
  }

  async extractFull(table: string, opts?: { limit?: number; offset?: number }): Promise<UnifiedChangeEvent[]> {
    if (!this.connected) throw new Error('Not connected');
    const params = new URLSearchParams();
    if (opts?.limit) params.set('limit', String(opts.limit));
    if (opts?.offset) params.set('offset', String(opts.offset));
    const resp = await fetch(this.baseUrl + '/rest/v1/' + table + '?' + params, { headers: this.headers() });
    if (!resp.ok) {
      if (resp.status === 404) throw new Error(`Table '${table}' not found`);
      throw new Error(`Failed to extract: ${resp.status}`);
    }
    const data = await resp.json();
    const items = Array.isArray(data) ? data : data.data || data.items || [];
    return items.map((item: Record<string, unknown>) => ({
      op: 'S' as const, table, after: item, before: null,
      ts: new Date(), watermark: null, sourceMetadata: { connector: 'supabase' }
    }));
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    const params = new URLSearchParams();
    if (opts?.watermarkColumn && opts?.watermarkValue) {
      params.set(opts.watermarkColumn, 'gt.' + opts.watermarkValue);
    }
    const resp = await fetch(this.baseUrl + '/rest/v1/' + table + '?' + params, { headers: this.headers() });
    const data = await resp.json();
    const items = Array.isArray(data) ? data : data.data || data.items || [];
    return items.map((item: Record<string, unknown>) => ({
      op: 'I' as const, table, after: item, before: null,
      ts: new Date(), watermark: null, sourceMetadata: { connector: 'supabase' }
    }));
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {}
  async stopCDC(): Promise<void> {}
}
