// @ts-nocheck
// Wise (TransferWise) connector — API token auth
// /v1/transfers, /v3/profiles/{id}/balance. CDC via createdDateStart. Offset pagination.

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface WiseConfig extends DatabaseConfig {
  apiToken: string;
  profileId: string;
  sandbox?: boolean;
}

const WISE_TABLES: Record<string, { endpoint: string; pk: string; columns: any[] }> = {
  transfers: {
    endpoint: '/v1/transfers',
    pk: 'id',
    columns: [
      { name: 'id', type: 'integer', nullable: false, defaultValue: null },
      { name: 'targetAccount', type: 'integer', nullable: false, defaultValue: null },
      { name: 'sourceAmount', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'sourceCurrency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'targetAmount', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'targetCurrency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'reference', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'created', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  balances: {
    endpoint: '/v3/profiles/{profileId}/balances?types=STANDARD',
    pk: 'id',
    columns: [
      { name: 'id', type: 'integer', nullable: false, defaultValue: null },
      { name: 'currency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'amount_value', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'amount_currency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'reservedAmount_value', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'type', type: 'varchar', nullable: false, defaultValue: null },
    ],
  },
  recipients: {
    endpoint: '/v1/accounts',
    pk: 'id',
    columns: [
      { name: 'id', type: 'integer', nullable: false, defaultValue: null },
      { name: 'accountHolderName', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'currency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'type', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'active', type: 'boolean', nullable: false, defaultValue: null },
    ],
  },
};

@registerSource('wise')
export class WiseConnector extends BaseConnector {
  private apiToken = '';
  private profileId = '';
  private baseUrl = 'https://api.transferwise.com';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    const wc = config as WiseConfig;
    this.apiToken = wc.apiToken;
    this.profileId = wc.profileId;
    this.baseUrl = wc.sandbox ? 'https://api.sandbox.transferwise.tech' : 'https://api.transferwise.com';
    this.config = config;
    const ok = await this.testConnection();
    if (!ok) throw new Error('Wise connection failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> { await this.stopCDC(); this.connected = false; }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/profiles`, { headers: this.authHeaders() });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return Object.keys(WISE_TABLES); }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = WISE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    return { table, columns: def.columns, primaryKeys: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      const since = new Date(Date.now() - 60000).toISOString();
      const url = `${this.baseUrl}/v1/transfers?profile=${this.profileId}&createdDateStart=${since}&limit=20`;
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) return;
      const items = await res.json() as any[];
      for (const item of items) {
        callback({ op: 'I', table: 'transfers', before: null, after: item, ts: new Date() });
      }
    }, 30000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const def = WISE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const endpoint = this.resolveEndpoint(def.endpoint);
      const sep = endpoint.includes('?') ? '&' : '?';
      const url = `${this.baseUrl}${endpoint}${sep}profile=${this.profileId}&offset=${offset}&limit=${limit}`;
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`Wise API error: ${res.status}`);
      const items = await res.json() as any[];
      if (!Array.isArray(items) || items.length === 0) break;

      for (const item of items) {
        events.push(createEvent('S', table, item, null, item.id?.toString(), { source: 'wise' }));
      }
      if (items.length < limit) break;
      offset += limit;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = WISE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString();
    let offset = 0;
    const limit = 100;

    while (true) {
      const endpoint = this.resolveEndpoint(def.endpoint);
      const sep = endpoint.includes('?') ? '&' : '?';
      const url = `${this.baseUrl}${endpoint}${sep}profile=${this.profileId}&createdDateStart=${since}&offset=${offset}&limit=${limit}`;
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`Wise API error: ${res.status}`);
      const items = await res.json() as any[];
      if (!Array.isArray(items) || items.length === 0) break;

      for (const item of items) {
        const ts = item.created || new Date().toISOString();
        events.push(createEvent('I', table, item, null, ts, { source: 'wise' }));
      }
      if (items.length < limit) break;
      offset += limit;
    }
    return events;
  }

  async getPrimaryKey(table: string): Promise<string> { return WISE_TABLES[table]?.pk || 'id'; }

  private resolveEndpoint(endpoint: string): string {
    return endpoint.replace('{profileId}', this.profileId);
  }

  private authHeaders(): Record<string, string> {
    return { 'Authorization': `Bearer ${this.apiToken}`, 'Content-Type': 'application/json' };
  }
}

