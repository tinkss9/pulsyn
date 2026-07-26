// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface AirtableConfig extends DatabaseConfig {
  apiToken: string;
  baseId: string;
  tableNames?: string[];
}

@registerSource('airtable')
export class AirtableConnector extends BaseConnector {
  private baseUrl = 'https://api.airtable.com/v0';
  private apiToken = '';
  private baseId = '';
  private tableNames: string[] = [];
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const ac = config as AirtableConfig;
    this.apiToken = ac.apiToken;
    this.baseId = ac.baseId;
    this.tableNames = ac.tableNames || [];

    if (this.tableNames.length === 0) {
      this.tableNames = await this.discoverTables();
    }

    const ok = await this.testConnection();
    if (!ok) throw new Error('Airtable connection test failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.tableNames.length === 0) return false;
      const res = await this.atFetch(`/${this.baseId}/${encodeURIComponent(this.tableNames[0])}?maxRecords=1`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return [...this.tableNames];
  }

  private async discoverTables(): Promise<string[]> {
    const res = await this.fetchWithRetry(`https://api.airtable.com/v0/meta/bases/${this.baseId}/tables`, {
      headers: { 'Authorization': `Bearer ${this.apiToken}` },
    });
    if (!res.ok) return [];
    const data = await res.json() as any;
    return (data.tables || []).map((t: any) => t.name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const res = await this.fetchWithRetry(`https://api.airtable.com/v0/meta/bases/${this.baseId}/tables`, {
      headers: { 'Authorization': `Bearer ${this.apiToken}` },
    });
    if (!res.ok) return { table, columns: [], primaryKeys: ['id'] };
    const data = await res.json() as any;
    const tbl = (data.tables || []).find((t: any) => t.name === table);
    if (!tbl) return { table, columns: [], primaryKeys: ['id'] };
    const columns = (tbl.fields || []).map((f: any) => ({
      name: f.name, type: f.type || 'string', nullable: true, defaultValue: null,
    }));
    return { table, columns, primaryKeys: ['id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const watermarks: Record<string, string> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        for (const table of this.tableNames) {
          const since = watermarks[table] || new Date(Date.now() - 60000).toISOString();
          const formula = encodeURIComponent(`IS_AFTER(LAST_MODIFIED_TIME(), '${since}')`);
          const res = await this.atFetch(`/${this.baseId}/${encodeURIComponent(table)}?filterByFormula=${formula}&maxRecords=100`);
          if (!res.ok) continue;
          const data = await res.json() as any;
          for (const record of data.records || []) {
            callback({ op: 'U', table, before: null, after: { id: record.id, ...record.fields }, ts: new Date() });
          }
          watermarks[table] = new Date().toISOString();
        }
      } catch { /* retry */ }
    }, 10000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    let offset: string | undefined = undefined;

    while (true) {
      const params = new URLSearchParams({ pageSize: '100' });
      if (offset) params.set('offset', offset);

      const res = await this.atFetch(`/${this.baseId}/${encodeURIComponent(table)}?${params}`);
      if (!res.ok) throw new Error(`Airtable extract failed: ${res.status}`);
      const data = await res.json() as any;

      for (const record of data.records || []) {
        events.push(createEvent({
          op: 'S', table, after: { id: record.id, ...record.fields },
          watermark: record.id,
          sourceMetadata: { source: 'airtable', baseId: this.baseId, recordId: record.id },
        }));
      }

      offset = data.offset;
      if (!offset || (data.records || []).length === 0) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString();
    const formula = encodeURIComponent(`IS_AFTER(LAST_MODIFIED_TIME(), '${since}')`);
    let offset: string | undefined = undefined;

    while (true) {
      const params = new URLSearchParams({ pageSize: '100', filterByFormula: decodeURIComponent(formula) });
      if (offset) params.set('offset', offset);

      const res = await this.atFetch(`/${this.baseId}/${encodeURIComponent(table)}?${params}`);
      if (!res.ok) throw new Error(`Airtable incremental failed: ${res.status}`);
      const data = await res.json() as any;

      for (const record of data.records || []) {
        events.push(createEvent({
          op: 'U', table, after: { id: record.id, ...record.fields },
          watermark: new Date().toISOString(),
          sourceMetadata: { source: 'airtable', baseId: this.baseId, recordId: record.id },
        }));
      }

      offset = data.offset;
      if (!offset || (data.records || []).length === 0) break;
    }
    return events;
  }

  private async atFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string> || {}),
    };
    return this.fetchWithRetry(url, { ...init, headers });
  }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch(url, init);
      if (res.status === 429) {
        // Airtable rate limit: 5 requests per second
        await this.sleep(Math.max(1000, 1000 * Math.pow(2, i)));
        continue;
      }
      if (res.status >= 500 && i < retries) {
        await this.sleep(Math.min(1000 * Math.pow(2, i), 30000));
        continue;
      }
      return res;
    }
    throw new Error('Airtable: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

