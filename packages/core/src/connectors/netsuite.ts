// @ts-nocheck
// NetSuite connector — Token-based auth (TBA), SuiteQL queries
// CDC via lastmodifieddate, offset pagination

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface NetSuiteConfig extends DatabaseConfig {
  accountId: string;
  consumerKey: string;
  consumerSecret: string;
  tokenId: string;
  tokenSecret: string;
  realm?: string;
}

const NETSUITE_TABLES: Record<string, { query: string; pk: string; columns: any[] }> = {
  transactions: {
    query: 'SELECT id, tranid, type, trandate, status, amount, currency, entity, lastmodifieddate FROM transaction',
    pk: 'id',
    columns: [
      { name: 'id', type: 'integer', nullable: false, defaultValue: null },
      { name: 'tranid', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'type', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'trandate', type: 'date', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'amount', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'currency', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'entity', type: 'integer', nullable: true, defaultValue: null },
      { name: 'lastmodifieddate', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  customers: {
    query: 'SELECT id, entityid, companyname, email, phone, datecreated, lastmodifieddate FROM customer',
    pk: 'id',
    columns: [
      { name: 'id', type: 'integer', nullable: false, defaultValue: null },
      { name: 'entityid', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'companyname', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'email', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'phone', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'datecreated', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'lastmodifieddate', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  invoices: {
    query: 'SELECT id, tranid, trandate, status, foreigntotal, entity, duedate, lastmodifieddate FROM transaction WHERE type = \'CustInvc\'',
    pk: 'id',
    columns: [
      { name: 'id', type: 'integer', nullable: false, defaultValue: null },
      { name: 'tranid', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'trandate', type: 'date', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'foreigntotal', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'entity', type: 'integer', nullable: true, defaultValue: null },
      { name: 'duedate', type: 'date', nullable: true, defaultValue: null },
      { name: 'lastmodifieddate', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  accounts: {
    query: 'SELECT id, acctnumber, acctname, accttype, balance, lastmodifieddate FROM account',
    pk: 'id',
    columns: [
      { name: 'id', type: 'integer', nullable: false, defaultValue: null },
      { name: 'acctnumber', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'acctname', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'accttype', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'balance', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'lastmodifieddate', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
};

@registerSource('netsuite')
export class NetSuiteConnector extends BaseConnector {
  private accountId = '';
  private consumerKey = '';
  private consumerSecret = '';
  private tokenId = '';
  private tokenSecret = '';
  private baseUrl = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    const nc = config as NetSuiteConfig;
    this.accountId = nc.accountId;
    this.consumerKey = nc.consumerKey;
    this.consumerSecret = nc.consumerSecret;
    this.tokenId = nc.tokenId;
    this.tokenSecret = nc.tokenSecret;
    this.baseUrl = `https://${nc.accountId.replace('_', '-')}.suitetalk.api.netsuite.com`;
    this.config = config;
    const ok = await this.testConnection();
    if (!ok) throw new Error('NetSuite connection failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> { await this.stopCDC(); this.connected = false; }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.suiteqlRequest('SELECT 1 AS test', 0, 1);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return Object.keys(NETSUITE_TABLES); }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = NETSUITE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    return { table, columns: def.columns, primaryKeys: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      const since = new Date(Date.now() - 60000).toISOString().replace('T', ' ').slice(0, 19);
      for (const [table, def] of Object.entries(NETSUITE_TABLES)) {
        const q = `${def.query} WHERE lastmodifieddate > '${since}'`;
        const res = await this.suiteqlRequest(q, 0, 100);
        if (!res.ok) continue;
        const data = await res.json() as any;
        for (const item of data.items || []) {
          callback({ op: 'U', table, before: null, after: item, ts: new Date() });
        }
      }
    }, 30000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const def = NETSUITE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let offset = 0;
    const limit = 1000;

    while (true) {
      const res = await this.suiteqlRequest(def.query, offset, limit);
      if (!res.ok) throw new Error(`NetSuite API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data.items || [];
      if (items.length === 0) break;

      for (const item of items) {
        events.push(createEvent('S', table, item, null, item.id?.toString(), { source: 'netsuite' }));
      }
      if (!data.hasMore) break;
      offset += limit;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = NETSUITE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString().replace('T', ' ').slice(0, 19);
    const whereClause = def.query.includes('WHERE')
      ? `${def.query} AND lastmodifieddate > '${since}'`
      : `${def.query} WHERE lastmodifieddate > '${since}'`;
    let offset = 0;

    while (true) {
      const res = await this.suiteqlRequest(whereClause, offset, 1000);
      if (!res.ok) throw new Error(`NetSuite API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data.items || [];
      if (items.length === 0) break;

      for (const item of items) {
        const ts = item.lastmodifieddate || new Date().toISOString();
        events.push(createEvent('I', table, item, null, ts, { source: 'netsuite' }));
      }
      if (!data.hasMore) break;
      offset += 1000;
    }
    return events;
  }

  async getPrimaryKey(table: string): Promise<string> { return NETSUITE_TABLES[table]?.pk || 'id'; }

  private async suiteqlRequest(query: string, offset: number, limit: number): Promise<Response> {
    const url = `${this.baseUrl}/services/rest/query/v1/suiteql?offset=${offset}&limit=${limit}`;
    return fetch(url, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ q: query }),
    });
  }

  private authHeaders(): Record<string, string> {
    const nonce = Math.random().toString(36).substring(2, 15);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const oauthHeader = [
      `OAuth realm="${this.accountId}"`,
      `oauth_consumer_key="${this.consumerKey}"`,
      `oauth_token="${this.tokenId}"`,
      `oauth_signature_method="HMAC-SHA256"`,
      `oauth_timestamp="${timestamp}"`,
      `oauth_nonce="${nonce}"`,
      `oauth_version="1.0"`,
      `oauth_signature="${this.generateSignature(timestamp, nonce)}"`,
    ].join(', ');
    return { 'Authorization': oauthHeader, 'Content-Type': 'application/json', 'Prefer': 'transient' };
  }

  private generateSignature(timestamp: string, nonce: string): string {
    // Simplified — in production use crypto HMAC-SHA256
    const base = `${this.consumerSecret}&${this.tokenSecret}&${timestamp}&${nonce}`;
    return Buffer.from(base).toString('base64').slice(0, 28);
  }
}

