// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface JiraConfig extends DatabaseConfig {
  domain: string;
  email: string;
  apiToken: string;
  projectKeys?: string[];
}

@registerSource('jira')
export class JiraCloudConnector extends BaseConnector {
  private baseUrl = '';
  private authHeader = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  private readonly issueTypes = ['issues', 'projects', 'boards', 'sprints', 'worklogs'];

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const jc = config as JiraConfig;
    this.baseUrl = `https://${jc.domain}.atlassian.net`;
    const creds = Buffer.from(`${jc.email}:${jc.apiToken}`).toString('base64');
    this.authHeader = `Basic ${creds}`;

    const ok = await this.testConnection();
    if (!ok) throw new Error('Jira Cloud connection test failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.jiraFetch('/rest/api/3/myself');
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return [...this.issueTypes];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'issues') {
      const res = await this.jiraFetch('/rest/api/3/field');
      if (!res.ok) throw new Error(`Failed to get Jira fields: ${res.status}`);
      const fields = await res.json() as any[];
      const columns = fields.map((f: any) => ({
        name: f.id, type: f.schema?.type || 'string', nullable: true, defaultValue: null,
      }));
      return { table, columns, primaryKeys: ['id'] };
    }
    return { table, columns: [], primaryKeys: ['id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const watermarks: Record<string, string> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const since = watermarks['issues'] || new Date(Date.now() - 60000).toISOString().split('.')[0];
        const jql = `updated >= "${since.replace('T', ' ').substring(0, 16)}"`;
        const res = await this.jiraFetch(`/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50`);
        if (!res.ok) return;
        const data = await res.json() as any;
        for (const issue of data.issues || []) {
          callback({ op: 'U', table: 'issues', before: null, after: issue.fields, ts: new Date() });
        }
        watermarks['issues'] = new Date().toISOString().split('.')[0];
      } catch { /* retry next cycle */ }
    }, 10000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table !== 'issues') {
      return this.extractResource(table);
    }

    const events: UnifiedChangeEvent[] = [];
    let startAt = 0;
    const maxResults = 100;

    while (true) {
      const jql = 'ORDER BY created ASC';
      const res = await this.jiraFetch(
        `/rest/api/3/search?jql=${encodeURIComponent(jql)}&startAt=${startAt}&maxResults=${maxResults}&fields=*all`
      );
      if (!res.ok) throw new Error(`Jira extract failed: ${res.status}`);
      const data = await res.json() as any;
      const issues = data.issues || [];

      for (const issue of issues) {
        events.push(createEvent({
          op: 'S', table: 'issues', after: { key: issue.key, ...issue.fields },
          watermark: issue.key,
          sourceMetadata: { source: 'jira', issueKey: issue.key, id: issue.id },
        }));
      }

      startAt += issues.length;
      if (startAt >= data.total || issues.length === 0) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString().split('.')[0].replace('T', ' ');
    let startAt = 0;
    const maxResults = 100;

    while (true) {
      const jql = `updated >= "${since}" ORDER BY updated ASC`;
      const res = await this.jiraFetch(
        `/rest/api/3/search?jql=${encodeURIComponent(jql)}&startAt=${startAt}&maxResults=${maxResults}&fields=*all`
      );
      if (!res.ok) throw new Error(`Jira incremental failed: ${res.status}`);
      const data = await res.json() as any;
      const issues = data.issues || [];

      for (const issue of issues) {
        events.push(createEvent({
          op: 'U', table: 'issues', after: { key: issue.key, ...issue.fields },
          watermark: issue.fields?.updated || null,
          sourceMetadata: { source: 'jira', issueKey: issue.key },
        }));
      }

      startAt += issues.length;
      if (startAt >= data.total || issues.length === 0) break;
    }
    return events;
  }

  private async extractResource(resource: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const pathMap: Record<string, string> = {
      projects: '/rest/api/3/project',
      boards: '/rest/agile/1.0/board',
      sprints: '/rest/agile/1.0/board',
      worklogs: '/rest/api/3/worklog/updated',
    };
    const res = await this.jiraFetch(pathMap[resource] || `/rest/api/3/${resource}`);
    if (!res.ok) return events;
    const data = await res.json() as any;
    const items = data.values || data || [];
    for (const item of (Array.isArray(items) ? items : [])) {
      events.push(createEvent({
        op: 'S', table: resource, after: item,
        watermark: item.id?.toString() || null,
        sourceMetadata: { source: 'jira' },
      }));
    }
    return events;
  }

  private async jiraFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': this.authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(init?.headers as Record<string, string> || {}),
    };
    return this.fetchWithRetry(url, { ...init, headers });
  }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch(url, init);
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '5', 10);
        await this.sleep(retryAfter * 1000);
        continue;
      }
      if (res.status >= 500 && i < retries) {
        await this.sleep(Math.min(1000 * Math.pow(2, i), 30000));
        continue;
      }
      return res;
    }
    throw new Error('Jira: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

