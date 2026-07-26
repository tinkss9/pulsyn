// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface RestConfig extends DatabaseConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  endpoints?: Record<string, string>;
  authType?: 'bearer' | 'basic' | 'apikey';
  authToken?: string;
  paginationType?: 'offset' | 'cursor' | 'link';
}

@registerSource('rest-api')
export class RestApiConnector extends BaseConnector {
  private baseUrl = '';
  private headers: Record<string, string> = {};
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const rc = config as RestConfig;
      this.baseUrl = rc.baseUrl || `${rc.host}`;
      this.headers = { 'Content-Type': 'application/json', ...rc.headers };

      if (rc.authType === 'bearer' && rc.authToken) {
        this.headers['Authorization'] = `Bearer ${rc.authToken}`;
      } else if (rc.authType === 'basic' && rc.username) {
        const creds = Buffer.from(`${rc.username}:${rc.password}`).toString('base64');
        this.headers['Authorization'] = `Basic ${creds}`;
      } else if (rc.authType === 'apikey' && rc.authToken) {
        this.headers['X-API-Key'] = rc.authToken;
      }

      const res = await fetch(this.baseUrl, { method: 'HEAD', headers: this.headers });
      if (!res.ok && res.status !== 405) throw new Error(`HTTP ${res.status}`);
      this.connected = true;
    } catch (error) {
      throw new Error(`REST API connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(this.baseUrl, { method: 'GET', headers: this.headers });
      return res.ok;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    const rc = this.config as RestConfig;
    if (rc.endpoints) return Object.keys(rc.endpoints);
    try {
      const res = await fetch(this.baseUrl, { headers: this.headers });
      const data = await res.json() as any;
      if (Array.isArray(data)) return data.map((d: any) => d.name || d.id || String(d));
      if (data.endpoints) return Object.keys(data.endpoints);
      if (data.resources) return data.resources.map((r: any) => r.name || r.path);
      return Object.keys(data);
    } catch (error) {
      throw new Error(`Failed to list endpoints: ${(error as Error).message}`);
    }
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    try {
      const url = this.resolveUrl(table);
      const res = await fetch(`${url}?limit=1`, { headers: this.headers });
      const data = await res.json() as any;
      const sample = Array.isArray(data) ? data[0] : data.data?.[0] || data.results?.[0] || data;
      if (!sample) return { table, columns: [], primaryKey: ['id'] };

      const columns = Object.entries(sample).map(([name, value]) => ({
        name,
        type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
        nullable: value === null,
        defaultValue: undefined,
      }));
      return { table, columns, primaryKey: ['id'] };
    } catch (error) {
      throw new Error(`Failed to get schema for ${table}: ${(error as Error).message}`);
    }
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const lastModified: Record<string, string> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const tables = await this.getTables();
        for (const table of tables) {
          const url = this.resolveUrl(table);
          const reqHeaders = { ...this.headers };
          if (lastModified[table]) reqHeaders['If-Modified-Since'] = lastModified[table];

          const res = await fetch(url, { headers: reqHeaders });
          if (res.status === 304) continue;
          if (!res.ok) continue;

          const modDate = res.headers.get('Last-Modified');
          if (modDate) lastModified[table] = modDate;

          const data = await res.json() as any;
          const items = Array.isArray(data) ? data : data.data || data.results || [];
          for (const item of items) {
            callback({ operation: 'UPDATE', table, before: undefined, after: item, ts: new Date() });
          }
        }
      } catch { /* polling error, retry */ }
    }, 5000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const rc = this.config as RestConfig;
    const paginationType = rc.paginationType || 'offset';
    let url: string | null = this.resolveUrl(table);
    let offset = 0;

    while (url) {
      try {
        const separator = url.includes('?') ? '&' : '?';
        const paginatedUrl = paginationType === 'offset'
          ? `${url}${separator}offset=${offset}&limit=${this.batchSize}` : url;

        const res = await fetch(paginatedUrl, { headers: this.headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json() as any;
        const items = Array.isArray(data) ? data : data.data || data.results || [];

        if (items.length === 0) break;
        for (const item of items) {
          events.push(createEvent({ operation: "S", name: table, data: item, watermark: String(null || ""), sourceMetadata: item.id?.toString() || offset.toString() }));
          offset++;
        }

        // Handle Link header pagination
        if (paginationType === 'link') {
          const link = res.headers.get('Link');
          const next = link?.match(/<([^>]+)>;\s*rel="next"/);
          url = next ? next[1] : undefined;
        } else if (items.length < this.batchSize) {
          break;
        }
      } catch (error) {
        throw new Error(`Extract failed: ${(error as Error).message}`);
      }
    }
    return events;
  }

  async extractIncremental(name: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const url = this.resolveUrl(table);
    const separator = url.includes('?') ? '&' : '?';
    const wmParam = watermark ? `${separator}since=${watermark}&limit=${this.batchSize}` : `${separator}limit=${this.batchSize}`;

    try {
      const res = await fetch(`${url}${wmParam}`, { headers: this.headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as any;
      const items = Array.isArray(data) ? data : data.data || data.results || [];
      for (const item of items) {
        const ts = item.updated_at || item.modified_at || new Date().toISOString();
        events.push(createEvent({ operation: "I", name: table, data: item, watermark: String(null || ""), sourceMetadata: ts }));
      }
    } catch (error) {
      throw new Error(`Incremental extract failed: ${(error as Error).message}`);
    }
    return events;
  }

  private resolveUrl(table: string): string {
    const rc = this.config as RestConfig;
    if (rc.endpoints?.[table]) return `${this.baseUrl}${rc.endpoints[table]}`;
    return `${this.baseUrl}/${table}`;
  }
}






