// @ts-nocheck
// SaaSConnector — Shared base class for REST API SaaS connectors
// Handles auth, pagination, rate limiting, error mapping, CDC polling

import { BaseConnector } from './base';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import type { SaaSResource, SaaSConnectorConfig, SaaSExtendedConfig } from './saas-types';

export { SaaSResource, SaaSConnectorConfig, SaaSExtendedConfig };

export abstract class SaaSConnector extends BaseConnector {
  protected saasConfig: SaaSConnectorConfig;
  protected apiKey = '';
  protected accessToken = '';
  protected refreshToken = '';
  protected clientId = '';
  protected clientSecret = '';
  protected tokenUrl = '';
  protected cdcActive = false;
  protected cdcTimer: ReturnType<typeof setInterval> | null = null;
  protected lastWatermark: Record<string, string> = {};

  // Rate limiting
  private rateLimitTokens: number;
  private rateLimitMax: number;
  private rateLimitWindow: number;
  private rateLimitLastRefill: number;

  constructor(
    id: string,
    name: string,
    engine: string,
    config: DatabaseConfig,
    saasConfig: SaaSConnectorConfig,
  ) {
    super(id, name, engine, config);
    this.saasConfig = saasConfig;
    this.rateLimitMax = saasConfig.rateLimit?.requests || 100;
    this.rateLimitTokens = this.rateLimitMax;
    this.rateLimitWindow = saasConfig.rateLimit?.windowMs || 60000;
    this.rateLimitLastRefill = Date.now();
  }

  // ─── Connection ─────────────────────────────────────────────

  async connect(config?: DatabaseConfig): Promise<void> {
    if (config) this.config = config;
    const ext = this.config as SaaSExtendedConfig;

    // Extract credentials from config
    this.apiKey = ext.apiKey || this.config.password || '';
    this.accessToken = ext.accessToken || this.config.password || '';
    this.refreshToken = ext.refreshToken || '';
    this.clientId = ext.clientId || '';
    this.clientSecret = ext.clientSecret || '';
    this.tokenUrl = ext.tokenUrl || '';

    // Refresh OAuth2 token if needed
    if (this.saasConfig.authType === 'oauth2_refresh' && this.refreshToken && this.clientId) {
      await this.refreshAccessToken();
    }

    // Validate connection
    const healthUrl = this.saasConfig.healthEndpoint || '/me';
    const res = await this.apiRequest(healthUrl);
    if (!res.ok && res.status !== 404) {
      throw new Error(`${this.engine} connection failed: HTTP ${res.status}`);
    }
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
    this.apiKey = '';
    this.accessToken = '';
  }

  async testConnection(): Promise<boolean> {
    try {
      const healthUrl = this.saasConfig.healthEndpoint || '/me';
      const res = await this.apiRequest(healthUrl);
      return res.ok || res.status === 404; // 404 on /me is OK — API is reachable
    } catch {
      return false;
    }
  }

  // ─── Schema Discovery ──────────────────────────────────────

  async getTables(): Promise<string[]> {
    if (!this.connected) throw new Error('Not connected');
    return this.saasConfig.resources.map(r => r.name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const resource = this.getResource(table);
    return resource.schema;
  }

  // ─── Extraction ─────────────────────────────────────────────

  async extractFull(table: string, opts?: { limit?: number; offset?: number }): Promise<UnifiedChangeEvent[]> {
    if (!this.connected) throw new Error('Not connected');
    const resource = this.getResource(table);
    const events: UnifiedChangeEvent[] = [];
    let page = 0;
    const pageSize = opts?.limit || this.batchSize;

    for await (const items of this.paginate(resource.endpoint, { pageSize })) {
      for (const item of items) {
        events.push(createEvent({
          op: 'S',
          table,
          after: item,
          key: { [resource.idField]: item[resource.idField] },
        }));
      }
      page++;
      if (opts?.limit && events.length >= opts.limit) break;
    }
    return events;
  }

  async extractIncremental(
    table: string,
    opts?: { watermarkColumn?: string; watermarkValue?: string },
  ): Promise<UnifiedChangeEvent[]> {
    const resource = this.getResource(table);
    const watermarkCol = opts?.watermarkColumn || resource.modifiedField;
    const watermarkVal = opts?.watermarkValue || this.lastWatermark[table];

    if (!watermarkCol) {
      return this.extractFull(table);
    }

    const events: UnifiedChangeEvent[] = [];
    const separator = resource.endpoint.includes('?') ? '&' : '?';
    const endpoint = watermarkVal
      ? `${resource.endpoint}${separator}${watermarkCol}=${encodeURIComponent(watermarkVal)}`
      : resource.endpoint;

    for await (const items of this.paginate(endpoint, { pageSize: this.batchSize })) {
      for (const item of items) {
        events.push(createEvent({
          op: watermarkVal ? 'U' : 'S',
          table,
          after: item,
          key: { [resource.idField]: item[resource.idField] },
        }));
      }
    }

    // Update watermark
    if (events.length > 0) {
      const lastItem = events[events.length - 1].after;
      if (lastItem && watermarkCol in lastItem) {
        this.lastWatermark[table] = String(lastItem[watermarkCol]);
      }
    }
    return events;
  }

  // ─── CDC ────────────────────────────────────────────────────

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const pollMs = (this.config as SaaSExtendedConfig)?.pollIntervalMs || 300000; // 5 min default

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        for (const resource of this.saasConfig.resources) {
          if (!resource.modifiedField) continue;
          const since = this.lastWatermark[resource.name];
          const separator = resource.endpoint.includes('?') ? '&' : '?';
          const endpoint = since
            ? `${resource.endpoint}${separator}${resource.modifiedField}=${encodeURIComponent(since)}`
            : resource.endpoint;

          for await (const items of this.paginate(endpoint, { pageSize: this.batchSize })) {
            for (const item of items) {
              callback({
                op: since ? 'UPDATE' : 'INSERT',
                table: resource.name,
                before: null,
                after: item,
                ts: new Date(),
              });
            }
          }
          // Update watermark
          this.lastWatermark[resource.name] = new Date().toISOString();
        }
      } catch {
        // Retry next cycle
      }
    }, pollMs);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) {
      clearInterval(this.cdcTimer);
      this.cdcTimer = null;
    }
  }

  // ─── HTTP Helpers ───────────────────────────────────────────

  protected async apiRequest(
    path: string,
    opts?: { method?: string; body?: any; headers?: Record<string, string> },
  ): Promise<Response> {
    // Rate limit check
    await this.waitForRateLimit();

    const url = path.startsWith('http') ? path : `${this.saasConfig.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.saasConfig.headers,
      ...opts?.headers,
    };

    // Auth headers
    switch (this.saasConfig.authType) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${this.accessToken || this.apiKey}`;
        break;
      case 'basic':
        headers['Authorization'] = `Basic ${Buffer.from(`${this.config.user || ''}:${this.apiKey}`).toString('base64')}`;
        break;
      case 'apikey':
        headers['X-API-Key'] = this.apiKey;
        break;
      case 'oauth2_refresh':
      case 'oauth2_client':
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        break;
    }

    const res = await fetch(url, {
      method: opts?.method || 'GET',
      headers,
      body: opts?.body ? JSON.stringify(opts.body) : undefined,
    });

    // Handle rate limiting
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
      await new Promise(r => setTimeout(r, waitMs));
      return this.apiRequest(path, opts); // Retry
    }

    // Handle token expiry
    if (res.status === 401 && this.saasConfig.authType === 'oauth2_refresh' && this.refreshToken) {
      await this.refreshAccessToken();
      return this.apiRequest(path, opts); // Retry with new token
    }

    return res;
  }

  protected async *paginate(
    endpoint: string,
    opts?: { pageSize?: number },
  ): AsyncGenerator<any[], void, unknown> {
    const pageSize = opts?.pageSize || this.batchSize;
    let url: string | null = endpoint;
    let page = 0;
    const maxPages = 1000; // Safety limit

    while (url && page < maxPages) {
      const separator = url.includes('?') ? '&' : '?';
      const fullUrl = url.startsWith('http')
        ? url
        : `${this.saasConfig.baseUrl}${url}${separator}limit=${pageSize}`;

      const res = await this.apiRequest(fullUrl);
      if (!res.ok) break;

      const data = await res.json() as any;

      // Extract items from various response shapes
      const items = Array.isArray(data)
        ? data
        : data.data || data.results || data.items || data.records || data.entries || [];

      if (items.length === 0) break;
      yield items;

      // Get next page URL based on pagination type
      url = this.getNextUrl(data, res, fullUrl, pageSize);
      page++;
    }
  }

  private getNextUrl(data: any, res: Response, currentUrl: string, pageSize: number): string | null {
    switch (this.saasConfig.paginationType) {
      case 'cursor':
        return data.next || data.paging?.next?.link || data.pagination?.next || data.cursor?.after
          ? (data.next || data.paging?.next?.link || data.pagination?.next || null)
          : null;
      case 'link': {
        const linkHeader = res.headers.get('Link');
        if (linkHeader) {
          const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
          return match ? match[1] : null;
        }
        return null;
      }
      case 'offset': {
        const offset = new URL(currentUrl, 'http://localhost').searchParams.get('offset');
        const currentOffset = offset ? parseInt(offset) : 0;
        if (data.total && currentOffset + pageSize < data.total) {
          const url = new URL(currentUrl, 'http://localhost');
          url.searchParams.set('offset', String(currentOffset + pageSize));
          return url.pathname + url.search;
        }
        return null;
      }
      default:
        return null;
    }
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.rateLimitLastRefill;
    if (elapsed > this.rateLimitWindow) {
      this.rateLimitTokens = this.rateLimitMax;
      this.rateLimitLastRefill = now;
    }
    if (this.rateLimitTokens <= 0) {
      const waitMs = this.rateLimitWindow - elapsed;
      if (waitMs > 0) await new Promise(r => setTimeout(r, waitMs));
      this.rateLimitTokens = this.rateLimitMax;
      this.rateLimitLastRefill = Date.now();
    }
    this.rateLimitTokens--;
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.tokenUrl || !this.clientId || !this.clientSecret) return;

    try {
      const res = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
        }),
      });
      if (res.ok) {
        const data = await res.json() as any;
        this.accessToken = data.access_token;
        if (data.refresh_token) this.refreshToken = data.refresh_token;
      }
    } catch {
      // Will fail on next request
    }
  }

  // ─── Helpers ────────────────────────────────────────────────

  protected getResource(table: string): SaaSResource {
    const resource = this.saasConfig.resources.find(r => r.name === table);
    if (!resource) throw new Error(`Table not found: ${table}. Available: ${this.saasConfig.resources.map(r => r.name).join(', ')}`);
    return resource;
  }
}
