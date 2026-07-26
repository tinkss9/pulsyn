// @ts-nocheck
// MYOB connector — OAuth2, /accountright/{company_id}/{resource}
// CDC via LastModified filter, skip/top pagination

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface MyobConfig extends DatabaseConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  companyFileId: string;
  companyFileUri?: string;
}

const MYOB_TABLES: Record<string, { resource: string; pk: string; columns: any[] }> = {
  accounts: {
    resource: 'GeneralLedger/Account',
    pk: 'UID',
    columns: [
      { name: 'UID', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'Name', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'DisplayID', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'Classification', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'Type', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'IsActive', type: 'boolean', nullable: false, defaultValue: null },
      { name: 'CurrentBalance', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'LastModified', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  contacts: {
    resource: 'Contact',
    pk: 'UID',
    columns: [
      { name: 'UID', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'CompanyName', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'FirstName', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'LastName', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'Type', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'IsActive', type: 'boolean', nullable: false, defaultValue: null },
      { name: 'LastModified', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  invoices: {
    resource: 'Sale/Invoice',
    pk: 'UID',
    columns: [
      { name: 'UID', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'Number', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'Date', type: 'date', nullable: false, defaultValue: null },
      { name: 'Status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'TotalAmount', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'BalanceDueAmount', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'CustomerUID', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'LastModified', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
  journal_transactions: {
    resource: 'GeneralLedger/JournalTransaction',
    pk: 'UID',
    columns: [
      { name: 'UID', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'DisplayID', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'DateOccurred', type: 'date', nullable: false, defaultValue: null },
      { name: 'Description', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'Amount', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'LastModified', type: 'timestamp', nullable: false, defaultValue: null },
    ],
  },
};

@registerSource('myob')
export class MyobConnector extends BaseConnector {
  private accessToken = '';
  private refreshToken = '';
  private companyFileId = '';
  private companyFileUri = '';
  private clientId = '';
  private clientSecret = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    const mc = config as MyobConfig;
    this.clientId = mc.clientId;
    this.clientSecret = mc.clientSecret;
    this.refreshToken = mc.refreshToken;
    this.companyFileId = mc.companyFileId;
    this.companyFileUri = mc.companyFileUri || `https://ar1.api.myob.com/accountright/${mc.companyFileId}`;
    this.config = config;
    await this.authenticate();
    this.connected = true;
  }

  async disconnect(): Promise<void> { await this.stopCDC(); this.connected = false; }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.companyFileUri}/Info`, { headers: this.authHeaders() });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return Object.keys(MYOB_TABLES); }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = MYOB_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    return { table, columns: def.columns, primaryKeys: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      const since = new Date(Date.now() - 60000).toISOString();
      for (const [table, def] of Object.entries(MYOB_TABLES)) {
        const url = `${this.companyFileUri}/${def.resource}?$filter=LastModified gt datetime'${since}'&$top=20`;
        const res = await fetch(url, { headers: this.authHeaders() });
        if (!res.ok) continue;
        const data = await res.json() as any;
        for (const item of data.Items || []) {
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
    const def = MYOB_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let skip = 0;
    const top = 400;

    while (true) {
      const url = `${this.companyFileUri}/${def.resource}?$top=${top}&$skip=${skip}`;
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`MYOB API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data.Items || [];
      if (items.length === 0) break;

      for (const item of items) {
        events.push(createEvent('S', table, item, null, item.UID, { source: 'myob' }));
      }
      if (items.length < top) break;
      skip += top;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = MYOB_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 86400000).toISOString();
    let skip = 0;
    const top = 400;

    while (true) {
      const url = `${this.companyFileUri}/${def.resource}?$filter=LastModified gt datetime'${since}'&$top=${top}&$skip=${skip}`;
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`MYOB API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data.Items || [];
      if (items.length === 0) break;

      for (const item of items) {
        events.push(createEvent('I', table, item, null, item.LastModified || new Date().toISOString(), { source: 'myob' }));
      }
      if (items.length < top) break;
      skip += top;
    }
    return events;
  }

  async getPrimaryKey(table: string): Promise<string> { return MYOB_TABLES[table]?.pk || 'UID'; }

  private async authenticate(): Promise<void> {
    const res = await fetch('https://secure.myob.com/oauth2/v1/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId, client_secret: this.clientSecret,
        refresh_token: this.refreshToken, grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) throw new Error(`MYOB OAuth failed: ${res.status}`);
    const data = await res.json() as any;
    this.accessToken = data.access_token;
    if (data.refresh_token) this.refreshToken = data.refresh_token;
  }

  private authHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'x-myobapi-key': this.clientId,
      'x-myobapi-version': 'v2',
      'Accept': 'application/json',
    };
  }
}

