// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface NotionConfig extends DatabaseConfig {
  apiToken: string;
  databaseIds?: string[];
}

@registerSource('notion')
export class NotionConnector extends BaseConnector {
  private baseUrl = 'https://api.notion.com/v1';
  private apiToken = '';
  private databaseIds: string[] = [];
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const nc = config as NotionConfig;
    this.apiToken = nc.apiToken;
    this.databaseIds = nc.databaseIds || [];

    const ok = await this.testConnection();
    if (!ok) throw new Error('Notion connection test failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.notionFetch('/users/me');
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    if (this.databaseIds.length > 0) return this.databaseIds;
    // Search for all databases the integration has access to
    const res = await this.notionFetch('/search', {
      method: 'POST',
      body: JSON.stringify({ filter: { value: 'database', property: 'object' }, page_size: 100 }),
    });
    if (!res.ok) return [];
    const data = await res.json() as any;
    return (data.results || []).map((db: any) => db.id);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const res = await this.notionFetch(`/databases/${table}`);
    if (!res.ok) throw new Error(`Failed to get Notion database: ${res.status}`);
    const data = await res.json() as any;
    const columns = Object.entries(data.properties || {}).map(([name, prop]: [string, any]) => ({
      name, type: prop.type || 'string', nullable: true, defaultValue: null,
    }));
    return { table, columns, primaryKeys: ['id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const watermarks: Record<string, string> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const tables = await this.getTables();
        for (const dbId of tables) {
          const since = watermarks[dbId] || new Date(Date.now() - 60000).toISOString();
          const body = JSON.stringify({
            filter: { timestamp: 'last_edited_time', last_edited_time: { after: since } },
            page_size: 100,
          });
          const res = await this.notionFetch(`/databases/${dbId}/query`, { method: 'POST', body });
          if (!res.ok) continue;
          const data = await res.json() as any;
          for (const page of data.results || []) {
            callback({ op: 'U', table: dbId, before: null, after: this.flattenPage(page), ts: new Date() });
          }
          watermarks[dbId] = new Date().toISOString();
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
    let startCursor: string | undefined = undefined;

    while (true) {
      const body: any = { page_size: 100 };
      if (startCursor) body.start_cursor = startCursor;

      const res = await this.notionFetch(`/databases/${table}/query`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Notion extract failed: ${res.status}`);
      const data = await res.json() as any;

      for (const page of data.results || []) {
        events.push(createEvent({
          op: 'S', table, after: this.flattenPage(page),
          watermark: page.id,
          sourceMetadata: { source: 'notion', databaseId: table, pageId: page.id },
        }));
      }

      if (!data.has_more || !data.next_cursor) break;
      startCursor = data.next_cursor;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString();
    let startCursor: string | undefined = undefined;

    while (true) {
      const body: any = {
        filter: { timestamp: 'last_edited_time', last_edited_time: { after: since } },
        sorts: [{ timestamp: 'last_edited_time', direction: 'ascending' }],
        page_size: 100,
      };
      if (startCursor) body.start_cursor = startCursor;

      const res = await this.notionFetch(`/databases/${table}/query`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Notion incremental failed: ${res.status}`);
      const data = await res.json() as any;

      for (const page of data.results || []) {
        events.push(createEvent({
          op: 'U', table, after: this.flattenPage(page),
          watermark: page.last_edited_time,
          sourceMetadata: { source: 'notion', databaseId: table, pageId: page.id },
        }));
      }

      if (!data.has_more || !data.next_cursor) break;
      startCursor = data.next_cursor;
    }
    return events;
  }

  private flattenPage(page: any): Record<string, any> {
    const flat: Record<string, any> = { id: page.id, created_time: page.created_time, last_edited_time: page.last_edited_time };
    for (const [key, prop] of Object.entries(page.properties || {})) {
      flat[key] = this.extractPropertyValue(prop as any);
    }
    return flat;
  }

  private extractPropertyValue(prop: any): any {
    switch (prop.type) {
      case 'title': return prop.title?.map((t: any) => t.plain_text).join('') || '';
      case 'rich_text': return prop.rich_text?.map((t: any) => t.plain_text).join('') || '';
      case 'number': return prop.number;
      case 'select': return prop.select?.name || null;
      case 'multi_select': return prop.multi_select?.map((s: any) => s.name) || [];
      case 'date': return prop.date?.start || null;
      case 'checkbox': return prop.checkbox;
      case 'url': return prop.url;
      case 'email': return prop.email;
      case 'phone_number': return prop.phone_number;
      case 'formula': return prop.formula?.[prop.formula?.type] || null;
      case 'relation': return prop.relation?.map((r: any) => r.id) || [];
      default: return null;
    }
  }

  private async notionFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Notion-Version': '2022-06-28',
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
    throw new Error('Notion: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

