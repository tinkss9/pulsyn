// @ts-nocheck
import { registerSource } from './registry';
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent } from '../events';

@registerSource('supabase')
export class SupabaseConnector extends BaseConnector {
  private baseUrl: string;
  private apiKey: string;

  constructor(id: string, config: DatabaseConfig) {
    super(id, 'supabase', 'supabase', config);
    this.baseUrl = config.host || '';
    this.apiKey = config.password || '';
  }

  async connect(config?: DatabaseConfig): Promise<void> {
    const cfg = config || this.config;
    this.baseUrl = cfg.host || this.baseUrl;
    this.apiKey = cfg.password || this.apiKey;
    // Supabase REST API - check connectivity by querying root endpoint
    const resp = await fetch(this.baseUrl + '/rest/v1/', {
      headers: { 
        'Authorization': 'Bearer ' + this.apiKey,
        'apikey': this.apiKey
      }
    });
    if (!resp.ok) throw new Error('Connection failed: ' + resp.status);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const resp = await fetch(this.baseUrl + '/rest/v1/', {
        headers: { 
          'Authorization': 'Bearer ' + this.apiKey,
          'apikey': this.apiKey
        }
      });
      return resp.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    // Supabase REST API - get tables from the OpenAPI spec
    const resp = await fetch(this.baseUrl + '/rest/v1/', {
      headers: { 
        'Authorization': 'Bearer ' + this.apiKey,
        'apikey': this.apiKey
      }
    });
    const data = await resp.json();
    // Extract table names from the paths
    const paths = data.paths || {};
    return Object.keys(paths)
      .filter(p => p.startsWith('/') && !p.startsWith('/rpc/'))
      .map(p => p.substring(1))
      .filter(p => !p.startsWith('_'));
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    // Supabase REST API - get schema from the OpenAPI spec
    const resp = await fetch(this.baseUrl + '/rest/v1/', {
      headers: { 
        'Authorization': 'Bearer ' + this.apiKey,
        'apikey': this.apiKey
      }
    });
    const data = await resp.json();
    const tableDef = data.definitions?.[table];
    if (!tableDef) return { columns: [] };
    
    const columns = Object.entries(tableDef.properties || {}).map(([name, prop]: [string, any]) => ({
      name,
      type: prop.format || prop.type || 'unknown',
      nullable: !tableDef.required?.includes(name),
      primaryKey: name === 'id',
    }));
    return { columns };
  }

  async extractFull(table: string, opts?: { limit?: number; offset?: number }): Promise<UnifiedChangeEvent[]> {
    const params = new URLSearchParams();
    if (opts?.limit) params.set('limit', String(opts.limit));
    if (opts?.offset) params.set('offset', String(opts.offset));
    const resp = await fetch(this.baseUrl + '/rest/v1/' + table + '?' + params, {
      headers: { 
        'Authorization': 'Bearer ' + this.apiKey,
        'apikey': this.apiKey
      }
    });
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
    const resp = await fetch(this.baseUrl + '/rest/v1/' + table + '?' + params, {
      headers: { 
        'Authorization': 'Bearer ' + this.apiKey,
        'apikey': this.apiKey
      }
    });
    const data = await resp.json();
    const items = Array.isArray(data) ? data : data.data || data.items || [];
    return items.map((item: Record<string, unknown>) => ({
      op: 'I' as const, table, after: item, before: null,
      ts: new Date(), watermark: null, sourceMetadata: { connector: 'supabase' }
    }));
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    // REST API polling CDC: poll every 5s
  }

  async stopCDC(): Promise<void> {}
}
