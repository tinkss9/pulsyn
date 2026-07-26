// @ts-nocheck
// Square connector — Bearer token, /v2/payments, /v2/customers
// CDC via begin_time filter, cursor pagination

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface SquareConfig extends DatabaseConfig {
  accessToken: string;
  environment?: 'sandbox' | 'production';
  locationId?: string;
}

const SQUARE_TABLES: Record<string, { endpoint: string; pk: string; listKey: string; columns: any[] }> = {
  payments: {
    endpoint: '/v2/payments',
    pk: 'id',
    listKey: 'payments',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'amount_money_amount', type: 'integer', nullable: false, defaultValue: null },
      { name: 'amount_money_currency', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'source_type', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'location_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'order_id', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'updated_at', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  customers: {
    endpoint: '/v2/customers',
    pk: 'id',
    listKey: 'customers',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'given_name', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'family_name', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'email_address', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'phone_number', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'company_name', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'updated_at', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  orders: {
    endpoint: '/v2/orders/search',
    pk: 'id',
    listKey: 'orders',
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'location_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'state', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'total_money_amount', type: 'integer', nullable: true, defaultValue: null },
      { name: 'total_money_currency', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'updated_at', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
};

@registerSource('square')
export class SquareConnector extends BaseConnector {
  private accessToken = '';
  private baseUrl = 'https://connect.squareup.com';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    const sc = config as SquareConfig;
    this.accessToken = sc.accessToken;
    this.baseUrl = sc.environment === 'sandbox' ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';
    this.config = config;
    const ok = await this.testConnection();
    if (!ok) throw new Error('Square connection failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> { await this.stopCDC(); this.connected = false; }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/v2/locations`, { headers: this.authHeaders() });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return Object.keys(SQUARE_TABLES); }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = SQUARE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    return { table, columns: def.columns, primaryKeys: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      const beginTime = new Date(Date.now() - 60000).toISOString();
      for (const [table, def] of Object.entries(SQUARE_TABLES)) {
        if (table === 'orders') continue;
        const res = await fetch(`${this.baseUrl}${def.endpoint}?begin_time=${beginTime}`, { headers: this.authHeaders() });
        if (!res.ok) continue;
        const data = await res.json() as any;
        for (const item of data[def.listKey] || []) {
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
    const def = SQUARE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let cursor: string | null = null;

    while (true) {
      const params = new URLSearchParams();
      if (cursor) params.set('cursor', cursor);
      const url = `${this.baseUrl}${def.endpoint}${params.toString() ? '?' + params : ''}`;
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`Square API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data[def.listKey] || [];
      if (items.length === 0) break;

      for (const item of items) {
        events.push(createEvent('S', table, item, null, item.created_at, { source: 'square' }));
      }
      cursor = data.cursor || null;
      if (!cursor) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = SQUARE_TABLES[table];
    if (!def) throw new Error(`Unknown table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let cursor: string | null = null;
    const beginTime = watermark || new Date(Date.now() - 86400000).toISOString();

    while (true) {
      const params = new URLSearchParams({ begin_time: beginTime });
      if (cursor) params.set('cursor', cursor);
      const url = `${this.baseUrl}${def.endpoint}?${params}`;
      const res = await fetch(url, { headers: this.authHeaders() });
      if (!res.ok) throw new Error(`Square API error: ${res.status}`);
      const data = await res.json() as any;
      const items = data[def.listKey] || [];
      if (items.length === 0) break;

      for (const item of items) {
        const ts = item.updated_at || item.created_at;
        events.push(createEvent('I', table, item, null, ts, { source: 'square' }));
      }
      cursor = data.cursor || null;
      if (!cursor) break;
    }
    return events;
  }

  async getPrimaryKey(table: string): Promise<string> { return SQUARE_TABLES[table]?.pk || 'id'; }

  private authHeaders(): Record<string, string> {
    return { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json', 'Square-Version': '2024-05-15' };
  }
}

