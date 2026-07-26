// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface GentrackG2Config extends DatabaseConfig {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  tokenUrl?: string;
  pollIntervalMs?: number;
}

const TABLE_DEFINITIONS: Record<string, { endpoint: string; pk: string; columns: any[] }> = {
  accounts: {
    endpoint: '/api/v2/accounts',
    pk: 'account_id',
    columns: [
      { name: 'account_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'account_name', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'account_type', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'updated_at', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  meters: {
    endpoint: '/api/v2/meters',
    pk: 'meter_id',
    columns: [
      { name: 'meter_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'serial_number', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'meter_type', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'icp', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'installed_date', type: 'date', nullable: true, defaultValue: null },
    ],
  },
  meter_readings: {
    endpoint: '/api/v2/meter-readings',
    pk: 'reading_id',
    columns: [
      { name: 'reading_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'meter_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'reading_date', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'value', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'unit', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'reading_type', type: 'varchar', nullable: true, defaultValue: null },
    ],
  },
  invoices: {
    endpoint: '/api/v2/invoices',
    pk: 'invoice_id',
    columns: [
      { name: 'invoice_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'account_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'invoice_date', type: 'date', nullable: false, defaultValue: null },
      { name: 'due_date', type: 'date', nullable: true, defaultValue: null },
      { name: 'total_amount', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: null },
    ],
  },
  payments: {
    endpoint: '/api/v2/payments',
    pk: 'payment_id',
    columns: [
      { name: 'payment_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'account_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'payment_date', type: 'timestamp', nullable: false, defaultValue: null },
      { name: 'amount', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'method', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'reference', type: 'varchar', nullable: true, defaultValue: null },
    ],
  },
  tariffs: {
    endpoint: '/api/v2/tariffs',
    pk: 'tariff_id',
    columns: [
      { name: 'tariff_id', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'tariff_code', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'description', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'rate', type: 'decimal', nullable: false, defaultValue: null },
      { name: 'effective_from', type: 'date', nullable: false, defaultValue: null },
      { name: 'effective_to', type: 'date', nullable: true, defaultValue: null },
    ],
  },
};

@registerSource('gentrack-g2')
export class GentrackG2Connector extends BaseConnector {
  private pool: any = null; // pg Pool
  private apiBaseUrl = '';
  private accessToken = '';
  private tokenExpiry = 0;
  private clientId = '';
  private clientSecret = '';
  private tokenUrl = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;
  private lastWatermark: Record<string, string> = {};

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const gc = config as GentrackG2Config;
      this.apiBaseUrl = gc.apiBaseUrl;
      this.clientId = gc.clientId;
      this.clientSecret = gc.clientSecret;
      this.tokenUrl = gc.tokenUrl || `${gc.apiBaseUrl}/oauth/token`;

      // Connect to database for bulk extraction
      const { Pool } = await import('pg');
      this.pool = new Pool({
        host: config.host,
        port: config.port || 5432,
        database: config.database,
        user: config.user,
        password: config.password,
        max: 10,
      });
      await this.pool.query('SELECT 1');

      // Authenticate OAuth2
      await this.refreshToken();
      this.connected = true;
    } catch (error) {
      throw new Error(`Gentrack G2 connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    if (this.pool) { await this.pool.end(); this.pool = null; }
    this.accessToken = '';
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const dbOk = await this.pool.query('SELECT 1');
      await this.ensureToken();
      const res = await fetch(`${this.apiBaseUrl}/api/v2/health`, {
        headers: this.getAuthHeaders(),
      });
      return dbOk.rows.length > 0 && res.ok;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    return Object.keys(TABLE_DEFINITIONS);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = TABLE_DEFINITIONS[table];
    if (!def) return { table, columns: [], primaryKeys: [] };
    return { table, columns: def.columns, primaryKeys: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const pollMs = (this.config as GentrackG2Config)?.pollIntervalMs || 30000;

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        await this.ensureToken();
        const tables = await this.getTables();
        for (const table of tables) {
          const def = TABLE_DEFINITIONS[table];
          const since = this.lastWatermark[table] || new Date(Date.now() - 60000).toISOString();
          const url = `${this.apiBaseUrl}${def.endpoint}?updated_since=${since}&limit=100`;
          const res = await fetch(url, { headers: this.getAuthHeaders() });
          if (!res.ok) continue;
          const data = await res.json() as any;
          const items = data.data || data.results || data;
          if (Array.isArray(items)) {
            for (const item of items) {
              callback({ op: 'U', table, before: null, after: item, ts: new Date() });
            }
          }
          this.lastWatermark[table] = new Date().toISOString();
        }
      } catch { /* retry next cycle */ }
    }, pollMs);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const def = TABLE_DEFINITIONS[table];
    if (!def) throw new Error(`Unknown Gentrack G2 table: ${table}`);
    if (!this.pool) throw new Error('Not connected');

    const events: UnifiedChangeEvent[] = [];
    let lastKey: any = null;

    // Use database for bulk extraction (more efficient than REST)
    while (true) {
      const q = lastKey
        ? `SELECT * FROM ${table} WHERE ${def.pk} > $1 ORDER BY ${def.pk} LIMIT $2`
        : `SELECT * FROM ${table} ORDER BY ${def.pk} LIMIT $1`;
      const params = lastKey ? [lastKey, this.batchSize] : [this.batchSize];
      const result = await this.pool.query(q, params);
      if (result.rows.length === 0) break;

      for (const row of result.rows) {
        events.push(createEvent('S', table, row, null, row[def.pk]?.toString(), { source: 'gentrack-g2' }));
      }
      lastKey = result.rows[result.rows.length - 1][def.pk];
      if (result.rows.length < this.batchSize) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = TABLE_DEFINITIONS[table];
    if (!def) throw new Error(`Unknown Gentrack G2 table: ${table}`);
    const events: UnifiedChangeEvent[] = [];

    // Use REST API for incremental (real-time changes)
    await this.ensureToken();
    const since = watermark || new Date(Date.now() - 3600000).toISOString();
    let url: string | null = `${this.apiBaseUrl}${def.endpoint}?updated_since=${since}&limit=${this.batchSize}`;

    while (url) {
      const res = await fetch(url, { headers: this.getAuthHeaders() });
      if (!res.ok) throw new Error(`G2 API error: HTTP ${res.status}`);
      const data = await res.json() as any;
      const items = data.data || data.results || [];
      for (const item of items) {
        const ts = item.updated_at || item.created_at || new Date().toISOString();
        events.push(createEvent('I', table, item, null, ts, { source: 'gentrack-g2' }));
      }
      url = data.next || data.links?.next || null;
    }
    this.lastWatermark[table] = new Date().toISOString();
    return events;
  }

  private async refreshToken(): Promise<void> {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!res.ok) throw new Error(`OAuth2 token request failed: HTTP ${res.status}`);
    const data = await res.json() as any;
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000 - 60000;
  }

  private async ensureToken(): Promise<void> {
    if (Date.now() >= this.tokenExpiry) await this.refreshToken();
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
    };
  }
}

