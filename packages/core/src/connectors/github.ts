// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface GithubConfig extends DatabaseConfig {
  token: string;
  owner: string;
  repo?: string;
}

@registerSource('github')
export class GithubConnector extends BaseConnector {
  private baseUrl = 'https://api.github.com';
  private token = '';
  private owner = '';
  private repo = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  private readonly resources = ['issues', 'pull_requests', 'commits', 'releases', 'branches', 'repos'];

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const gc = config as GithubConfig;
    this.token = gc.token;
    this.owner = gc.owner;
    this.repo = gc.repo || '';

    const ok = await this.testConnection();
    if (!ok) throw new Error('GitHub connection test failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.ghFetch('/user');
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return [...this.resources];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const path = this.resourcePath(table, '?per_page=1');
    const res = await this.ghFetch(path);
    if (!res.ok) return { table, columns: [], primaryKeys: ['id'] };
    const data = await res.json() as any;
    const sample = Array.isArray(data) ? data[0] : data.items?.[0];
    if (!sample) return { table, columns: [], primaryKeys: ['id'] };
    const columns = Object.entries(sample).map(([name, value]) => ({
      name, type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
      nullable: value === null, defaultValue: null,
    }));
    return { table, columns, primaryKeys: ['id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const watermarks: Record<string, string> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        for (const resource of ['issues', 'pull_requests', 'commits']) {
          const since = watermarks[resource] || new Date(Date.now() - 60000).toISOString();
          const path = this.resourcePath(resource, `?since=${since}&per_page=50`);
          const res = await this.ghFetch(path);
          if (!res.ok) continue;
          const items = await res.json() as any[];
          for (const item of items || []) {
            callback({ op: 'U', table: resource, before: null, after: item, ts: new Date() });
          }
          watermarks[resource] = new Date().toISOString();
        }
      } catch { /* retry */ }
    }, 15000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    let url: string | null = this.resourcePath(table, '?per_page=100');

    while (url) {
      const res = await this.ghFetch(url);
      if (!res.ok) throw new Error(`GitHub extract failed: ${res.status}`);
      const items = await res.json() as any[];

      for (const item of items || []) {
        events.push(createEvent({
          op: 'S', table, after: item,
          watermark: item.id?.toString() || item.sha || null,
          sourceMetadata: { source: 'github', owner: this.owner, repo: this.repo },
        }));
      }

      // Link header pagination
      url = this.parseNextLink(res.headers.get('Link'));
      if ((items || []).length === 0) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString();
    let url: string | null = this.resourcePath(table, `?since=${since}&per_page=100&sort=updated&direction=asc`);

    while (url) {
      const res = await this.ghFetch(url);
      if (!res.ok) throw new Error(`GitHub incremental failed: ${res.status}`);
      const items = await res.json() as any[];

      for (const item of items || []) {
        events.push(createEvent({
          op: 'U', table, after: item,
          watermark: item.updated_at || item.created_at || null,
          sourceMetadata: { source: 'github', owner: this.owner, repo: this.repo },
        }));
      }

      url = this.parseNextLink(res.headers.get('Link'));
      if ((items || []).length === 0) break;
    }
    return events;
  }

  private resourcePath(table: string, query: string): string {
    const repoBase = this.repo ? `/repos/${this.owner}/${this.repo}` : `/users/${this.owner}/repos`;
    const map: Record<string, string> = {
      issues: `${repoBase}/issues${query}`,
      pull_requests: `${repoBase}/pulls${query}`,
      commits: `${repoBase}/commits${query}`,
      releases: `${repoBase}/releases${query}`,
      branches: `${repoBase}/branches${query}`,
      repos: `/users/${this.owner}/repos${query}`,
    };
    return map[table] || `${repoBase}/${table}${query}`;
  }

  private parseNextLink(linkHeader: string | null): string | null {
    if (!linkHeader) return null;
    const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    if (!match) return null;
    const fullUrl = match[1];
    try {
      const parsed = new URL(fullUrl);
      return parsed.pathname + parsed.search;
    } catch { return null; }
  }

  private async ghFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers as Record<string, string> || {}),
    };
    return this.fetchWithRetry(url, { ...init, headers });
  }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch(url, init);
      if (res.status === 429 || res.status === 403) {
        const resetAt = res.headers.get('X-RateLimit-Reset');
        const waitMs = resetAt ? (parseInt(resetAt, 10) * 1000 - Date.now()) : 60000;
        await this.sleep(Math.min(Math.max(waitMs, 1000), 120000));
        continue;
      }
      if (res.status >= 500 && i < retries) {
        await this.sleep(Math.min(1000 * Math.pow(2, i), 30000));
        continue;
      }
      return res;
    }
    throw new Error('GitHub: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

