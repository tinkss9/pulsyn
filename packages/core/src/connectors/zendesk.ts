// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface ZendeskConfig extends DatabaseConfig {
  subdomain: string;
  email?: string;
  apiToken?: string;
  accessToken?: string;
}

@registerSource('zendesk')
export class ZendeskConnector extends BaseConnector {
  private baseUrl = '';
  private authHeader = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  private readonly resources = ['tickets', 'users', 'organizations', 'groups', 'ticket_fields', 'brands'];

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const zc = config as ZendeskConfig;
    this.baseUrl = `https://${zc.subdomain}.zendesk.com`;

    if (zc.accessToken) {
      this.authHeader = `Bearer ${zc.accessToken}`;
    } else if (zc.email && zc.apiToken) {
      const creds = Buffer.from(`${zc.email}/token:${zc.apiToken}`).toString('base64');
      this.authHeader = `Basic ${creds}`;
    } else {
      throw new Error('Zendesk: accessToken or email+apiToken required');
    }

    const ok = await this.testConnection();
    if (!ok) throw new Error('Zendesk connection test failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.zdFetch('/api/v2/tickets.json?per_page=1');
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return [...this.resources];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const res = await this.zdFetch(`/api/v2/${table}.json?per_page=1`);
    if (!res.ok) throw new Error(`Schema fetch failed for ${table}: ${res.status}`);
    const data = await res.json() as any;
    const items = data[table] || data.results || [];
    const sample = items[0];
    if (!sample) return { table, columns: [], primaryKeys: ['id'] };
    const columns = Object.entries(sample).map(([name, value]) => ({
      name, type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
      nullable: value === null, defaultValue: null,
    }));
    return { table, columns, primaryKeys: ['id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const cursors: Record<string, number> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        for (const resource of this.resources.slice(0, 3)) {
          const startTime = cursors[resource] || Math.floor(Date.now() / 1000) - 60;
          const res = await this.zdFetch(`/api/v2/incremental/${resource}.json?start_time=${startTime}`);
          if (!res.ok) continue;
          const data = await res.json() as any;
          for (const item of data[resource] || []) {
            callback({ op: 'U', table: resource, before: null, after: item, ts: new Date() });
          }
          if (data.end_time) cursors[resource] = data.end_time;
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
    let url: string | null = `/api/v2/${table}.json?per_page=100`;

    while (url) {
      const res = await this.zdFetch(url);
      if (!res.ok) throw new Error(`Zendesk extract failed: ${res.status}`);
      const data = await res.json() as any;
      const items = data[table] || data.results || [];

      for (const item of items) {
        events.push(createEvent({
          op: 'S', table, after: item,
          watermark: item.id?.toString() || null,
          sourceMetadata: { source: 'zendesk', id: item.id },
        }));
      }

      url = data.next_page ? new URL(data.next_page).pathname + new URL(data.next_page).search : null;
      if (items.length === 0) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const startTime = watermark ? parseInt(watermark, 10) : Math.floor(Date.now() / 1000) - 86400;
    let url: string | null = `/api/v2/incremental/${table}.json?start_time=${startTime}`;

    while (url) {
      const res = await this.zdFetch(url);
      if (!res.ok) throw new Error(`Zendesk incremental failed: ${res.status}`);
      const data = await res.json() as any;
      const items = data[table] || [];

      for (const item of items) {
        events.push(createEvent({
          op: 'U', table, after: item,
          watermark: data.end_time?.toString() || null,
          sourceMetadata: { source: 'zendesk', id: item.id },
        }));
      }

      if (data.end_of_stream || !data.next_page) break;
      url = new URL(data.next_page).pathname + new URL(data.next_page).search;
    }
    return events;
  }

  private async zdFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': this.authHeader,
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string> || {}),
    };
    return this.fetchWithRetry(url, { ...init, headers });
  }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch(url, init);
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '60', 10);
        await this.sleep(retryAfter * 1000);
        continue;
      }
      if (res.status >= 500 && i < retries) {
        await this.sleep(Math.min(1000 * Math.pow(2, i), 30000));
        continue;
      }
      return res;
    }
    throw new Error('Zendesk: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

