// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface HubspotConfig extends DatabaseConfig {
  accessToken: string;
  apiKey?: string;
  portalId?: string;
}

@registerSource('hubspot')
export class HubspotConnector extends BaseConnector {
  private baseUrl = 'https://api.hubapi.com';
  private accessToken = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  private readonly objectTypes = ['contacts', 'companies', 'deals', 'tickets', 'products', 'line_items'];

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const hc = config as HubspotConfig;
    this.accessToken = hc.accessToken || hc.apiKey || '';
    if (!this.accessToken) throw new Error('HubSpot: accessToken or apiKey required');
    const ok = await this.testConnection();
    if (!ok) throw new Error('HubSpot connection test failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.hubFetch('/crm/v3/objects/contacts?limit=1');
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return [...this.objectTypes];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const res = await this.hubFetch(`/crm/v3/properties/${table}`);
    if (!res.ok) throw new Error(`Failed to get properties for ${table}: ${res.status}`);
    const data = await res.json() as any;
    const columns = (data.results || []).map((p: any) => ({
      name: p.name,
      type: p.type || 'string',
      nullable: true,
      defaultValue: null,
    }));
    return { table, columns, primaryKeys: ['hs_object_id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const watermarks: Record<string, string> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        for (const obj of this.objectTypes) {
          const since = watermarks[obj] || new Date(Date.now() - 60000).toISOString();
          const filter = JSON.stringify({
            filterGroups: [{ filters: [{ propertyName: 'hs_lastmodifieddate', operator: 'GTE', value: since }] }],
            limit: 100,
          });
          const res = await this.hubFetch(`/crm/v3/objects/${obj}/search`, {
            method: 'POST',
            body: filter,
          });
          if (!res.ok) continue;
          const data = await res.json() as any;
          for (const item of data.results || []) {
            callback({ op: 'U', table: obj, before: null, after: item.properties, ts: new Date() });
          }
          watermarks[obj] = new Date().toISOString();
        }
      } catch { /* retry next cycle */ }
    }, 10000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    let after: string | undefined = undefined;

    while (true) {
      const params = new URLSearchParams({ limit: '100' });
      if (after) params.set('after', after);

      const res = await this.hubFetch(`/crm/v3/objects/${table}?${params}`);
      if (!res.ok) throw new Error(`HubSpot extract failed: ${res.status}`);
      const data = await res.json() as any;

      for (const item of data.results || []) {
        events.push(createEvent({
          op: 'S', table, after: item.properties,
          watermark: item.id,
          sourceMetadata: { source: 'hubspot', objectId: item.id },
        }));
      }

      after = data.paging?.next?.after;
      if (!after || (data.results || []).length === 0) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString();
    let after: string | undefined = undefined;

    while (true) {
      const body = JSON.stringify({
        filterGroups: [{ filters: [{ propertyName: 'hs_lastmodifieddate', operator: 'GTE', value: since }] }],
        sorts: [{ propertyName: 'hs_lastmodifieddate', direction: 'ASCENDING' }],
        limit: 100,
        ...(after ? { after } : {}),
      });

      const res = await this.hubFetch(`/crm/v3/objects/${table}/search`, { method: 'POST', body });
      if (!res.ok) throw new Error(`HubSpot incremental failed: ${res.status}`);
      const data = await res.json() as any;

      for (const item of data.results || []) {
        events.push(createEvent({
          op: 'U', table, after: item.properties,
          watermark: item.properties?.hs_lastmodifieddate || new Date().toISOString(),
          sourceMetadata: { source: 'hubspot', objectId: item.id },
        }));
      }

      after = data.paging?.next?.after;
      if (!after || (data.results || []).length === 0) break;
    }
    return events;
  }

  private async hubFetch(path: string, init?: RequestInit): Promise<Response> {
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
        const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10);
        await this.sleep(retryAfter * 1000);
        continue;
      }
      if (res.status >= 500 && i < retries) {
        await this.sleep(Math.min(1000 * Math.pow(2, i), 30000));
        continue;
      }
      return res;
    }
    throw new Error('HubSpot: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

