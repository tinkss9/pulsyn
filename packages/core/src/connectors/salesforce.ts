// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface SalesforceConfig extends DatabaseConfig {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  username?: string;
  password?: string;
  apiVersion?: string;
}

@registerSource('salesforce')
export class SalesforceConnector extends BaseConnector {
  private instanceUrl = '';
  private accessToken = '';
  private apiVersion = 'v59.0';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const sf = config as SalesforceConfig;
    this.instanceUrl = sf.instanceUrl.replace(/\/$/, '');
    this.apiVersion = sf.apiVersion || 'v59.0';
    await this.authenticate(sf);
    this.connected = true;
  }

  private async authenticate(sf: SalesforceConfig): Promise<void> {
    const params = new URLSearchParams();
    if (sf.refreshToken) {
      params.set('grant_type', 'refresh_token');
      params.set('refresh_token', sf.refreshToken);
    } else {
      params.set('grant_type', 'password');
      params.set('username', sf.username || '');
      params.set('password', sf.password || '');
    }
    params.set('client_id', sf.clientId);
    params.set('client_secret', sf.clientSecret);

    const res = await this.fetchWithRetry(`${this.instanceUrl}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!res.ok) throw new Error(`Salesforce auth failed: ${res.status} ${await res.text()}`);
    const data = await res.json() as any;
    this.accessToken = data.access_token;
    if (data.instance_url) this.instanceUrl = data.instance_url;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.accessToken = '';
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.sfFetch(`/services/data/${this.apiVersion}/sobjects`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const res = await this.sfFetch(`/services/data/${this.apiVersion}/sobjects`);
    if (!res.ok) throw new Error(`Failed to list sobjects: ${res.status}`);
    const data = await res.json() as any;
    return data.sobjects
      .filter((s: any) => s.queryable && !s.deprecatedAndHidden)
      .map((s: any) => s.name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const res = await this.sfFetch(`/services/data/${this.apiVersion}/sobjects/${table}/describe`);
    if (!res.ok) throw new Error(`Failed to describe ${table}: ${res.status}`);
    const data = await res.json() as any;
    const columns = data.fields.map((f: any) => ({
      name: f.name,
      type: f.type,
      nullable: f.nillable,
      defaultValue: f.defaultValue,
    }));
    const pks = data.fields.filter((f: any) => f.name === 'Id').map((f: any) => f.name);
    return { table, columns, primaryKeys: pks.length ? pks : ['Id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const watermarks: Record<string, string> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const tables = await this.getTables();
        for (const table of tables.slice(0, 20)) {
          const end = new Date().toISOString();
          const start = watermarks[table] || new Date(Date.now() - 60000).toISOString();
          const url = `/services/data/${this.apiVersion}/sobjects/${table}/updated/?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
          const res = await this.sfFetch(url);
          if (!res.ok) continue;
          const data = await res.json() as any;
          for (const id of data.ids || []) {
            callback({ op: 'U', table, before: null, after: { Id: id }, ts: new Date() });
          }
          watermarks[table] = end;
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
    // Use Bulk API 2.0 for full extract
    const jobRes = await this.sfFetch(`/services/data/${this.apiVersion}/jobs/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'query', query: `SELECT FIELDS(ALL) FROM ${table} LIMIT 200000` }),
    });
    if (!jobRes.ok) throw new Error(`Bulk job creation failed: ${jobRes.status}`);
    const job = await jobRes.json() as any;
    const jobId = job.id;

    // Poll until complete
    let state = 'UploadComplete';
    while (state !== 'JobComplete' && state !== 'Failed' && state !== 'Aborted') {
      await this.sleep(3000);
      const statusRes = await this.sfFetch(`/services/data/${this.apiVersion}/jobs/query/${jobId}`);
      const statusData = await statusRes.json() as any;
      state = statusData.state;
    }
    if (state !== 'JobComplete') throw new Error(`Bulk job failed with state: ${state}`);

    // Fetch results
    let locator: string | null = null;
    while (true) {
      const url = locator
        ? `/services/data/${this.apiVersion}/jobs/query/${jobId}/results?locator=${locator}`
        : `/services/data/${this.apiVersion}/jobs/query/${jobId}/results`;
      const res = await this.sfFetch(url);
      if (!res.ok) break;

      const csvText = await res.text();
      const rows = this.parseCsv(csvText);
      for (const row of rows) {
        events.push(createEvent({ op: 'S', table, after: row, watermark: row.Id || null, sourceMetadata: { source: 'salesforce', jobId } }));
      }

      locator = res.headers.get('Sforce-Locator');
      if (!locator || locator === 'null') break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString();
    const soql = `SELECT FIELDS(ALL) FROM ${table} WHERE SystemModstamp > ${since} ORDER BY SystemModstamp ASC LIMIT 2000`;
    let url: string | null = `/services/data/${this.apiVersion}/query?q=${encodeURIComponent(soql)}`;

    while (url) {
      const res = await this.sfFetch(url);
      if (!res.ok) throw new Error(`SOQL query failed: ${res.status}`);
      const data = await res.json() as any;
      for (const record of data.records || []) {
        events.push(createEvent({ op: 'U', table, after: record, watermark: record.SystemModstamp, sourceMetadata: { source: 'salesforce' } }));
      }
      url = data.nextRecordsUrl || null;
    }
    return events;
  }

  private async sfFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = path.startsWith('http') ? path : `${this.instanceUrl}${path}`;
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
      if (res.status === 429 || res.status >= 500) {
        if (i === retries) return res;
        const delay = Math.min(1000 * Math.pow(2, i), 30000);
        await this.sleep(delay);
        continue;
      }
      return res;
    }
    throw new Error('Unreachable');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

  private parseCsv(csv: string): Record<string, any>[] {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const row: Record<string, any> = {};
      headers.forEach((h, i) => { row[h] = values[i] || null; });
      return row;
    });
  }
}

