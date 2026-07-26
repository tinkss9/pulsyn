// @ts-nocheck
// Wave connector — GraphQL API (Kraken pattern), OAuth2
// Cursor-based pagination

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface WaveConfig extends DatabaseConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  businessId: string;
}

const WAVE_TABLES: Record<string, { query: string; pk: string; rootField: string; columns: any[] }> = {
  invoices: {
    pk: 'id',
    rootField: 'invoices',
    query: `query($businessId: ID!, $cursor: String) {
      business(id: $businessId) { invoices(after: $cursor, first: 50) {
        edges { node { id invoiceNumber status amountDue { value currency { code } } amountPaid { value } customer { id name } invoiceDate dueDate createdAt modifiedAt } cursor }
        pageInfo { hasNextPage endCursor }
      }}
    }`,
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'invoiceNumber', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'amountDue_value', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'amountDue_currency', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'amountPaid_value', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'customer_id', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'customer_name', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'invoiceDate', type: 'date', nullable: false, defaultValue: null },
      { name: 'createdAt', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'modifiedAt', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  customers: {
    pk: 'id',
    rootField: 'customers',
    query: `query($businessId: ID!, $cursor: String) {
      business(id: $businessId) { customers(after: $cursor, first: 50) {
        edges { node { id name email address { city province country } currency { code } createdAt modifiedAt } cursor }
        pageInfo { hasNextPage endCursor }
      }}
    }`,
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'name', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'email', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'address_city', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'currency_code', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'createdAt', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'modifiedAt', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  accounts: {
    pk: 'id',
    rootField: 'accounts',
    query: `query($businessId: ID!, $cursor: String) {
      business(id: $businessId) { accounts(after: $cursor, first: 50) {
        edges { node { id name type { value } subtype { value } currency { code } balance createdAt modifiedAt } cursor }
        pageInfo { hasNextPage endCursor }
      }}
    }`,
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'name', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'type', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'subtype', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'currency_code', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'balance', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'createdAt', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'modifiedAt', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  transactions: {
    pk: 'id',
    rootField: 'transactions',
    query: `query($businessId: ID!, $cursor: String) {
      business(id: $businessId) { transactions(after: $cursor, first: 50) {
        edges { node { id description amount { value currency { code } } account { id name } date createdAt modifiedAt } cursor }
        pageInfo { hasNextPage endCursor }
      }}
    }`,
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'description', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'amount_value', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'amount_currency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'account_id', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'date', type: 'date', nullable: false, defaultValue: null },
      { name: 'createdAt', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'modifiedAt', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
};

@registerSource('wave')
export class WaveConnector extends BaseConnector {
  private accessToken = '';
  private refreshToken = '';
  private clientId = '';
  private clientSecret = '';
  private businessId = '';
  private gqlUrl = 'https://gql.waveapps.com/graphql/public';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    const wc = config as WaveConfig;
    this.clientId = wc.clientId;
    this.clientSecret = wc.clientSecret;
    this.refreshToken = wc.refreshToken;
    this.businessId = wc.businessId;
    this.config = config;
    await this.authenticate();
    this.connected = true;
  }

  async disconnect(): Promise<void> { await this.stopCDC(); this.connected = false; }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.gqlRequest('query { user { id } }', {});
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return Object.keys(WAVE_TABLES); }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = WAVE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    return { table, columns: def.columns, primaryKeys: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      for (const [table, def] of Object.entries(WAVE_TABLES)) {
        const res = await this.gqlRequest(def.query, { businessId: this.businessId, cursor: null });
        if (!res.ok) continue;
        const data = await res.json() as any;
        const edges = data.data?.business?.[def.rootField]?.edges || [];
        for (const edge of edges.slice(-5)) {
          callback({ op: 'U', table, before: null, after: this.flattenNode(edge.node), ts: new Date() });
        }
      }
    }, 60000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const def = WAVE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let cursor: string | null = null;

    while (true) {
      const res = await this.gqlRequest(def.query, { businessId: this.businessId, cursor });
      if (!res.ok) throw new Error(`Wave GraphQL error: ${res.status}`);
      const data = await res.json() as any;
      const connection = data.data?.business?.[def.rootField];
      const edges = connection?.edges || [];
      if (edges.length === 0) break;

      for (const edge of edges) {
        const node = this.flattenNode(edge.node);
        events.push(createEvent('S', table, node, null, node.id, { source: 'wave' }));
      }
      if (!connection?.pageInfo?.hasNextPage) break;
      cursor = connection.pageInfo.endCursor;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = WAVE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    // Wave GraphQL doesn't support date filtering natively — full extract + filter
    const allEvents = await this.extractFull(table);
    if (!watermark) return allEvents;
    const wmDate = new Date(watermark).getTime();
    return allEvents.filter(e => {
      const ts = e.after?.modifiedAt || e.after?.createdAt;
      return ts && new Date(ts).getTime() > wmDate;
    }).map(e => ({ ...e, op: 'I' as const }));
  }

  async getPrimaryKey(table: string): Promise<string> { return WAVE_TABLES[table]?.pk || 'id'; }

  private async gqlRequest(query: string, variables: Record<string, any>): Promise<Response> {
    return fetch(this.gqlUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
  }

  private async authenticate(): Promise<void> {
    const res = await fetch('https://api.waveapps.com/oauth2/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId, client_secret: this.clientSecret,
        refresh_token: this.refreshToken, grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) throw new Error(`Wave OAuth failed: ${res.status}`);
    const data = await res.json() as any;
    this.accessToken = data.access_token;
    if (data.refresh_token) this.refreshToken = data.refresh_token;
  }

  private flattenNode(node: Record<string, any>): Record<string, any> {
    const flat: Record<string, any> = {};
    for (const [key, val] of Object.entries(node)) {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        for (const [subKey, subVal] of Object.entries(val)) {
          if (subVal && typeof subVal === 'object' && 'code' in (subVal as any)) {
            flat[`${key}_${subKey}`] = (subVal as any).code;
          } else if (subVal && typeof subVal === 'object' && 'value' in (subVal as any)) {
            flat[`${key}_${subKey}`] = (subVal as any).value;
          } else {
            flat[`${key}_${subKey}`] = subVal;
          }
        }
      } else {
        flat[key] = val;
      }
    }
    return flat;
  }
}

