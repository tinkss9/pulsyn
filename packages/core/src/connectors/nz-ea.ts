// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface NzEaConfig extends DatabaseConfig {
  baseUrl?: string;
  apiKey?: string;
  pollIntervalMs?: number;
}

const NZ_EA_BASE = 'https://api.em6.co.nz';

const TABLE_ENDPOINTS: Record<string, { path: string; pk: string; columns: any[] }> = {
  spot_prices: {
    path: '/prices/spot',
    pk: 'timestamp',
    columns: [
      { name: 'timestamp', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'node', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'price', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'trading_period', type: 'integer', nullable: false, defaultValue: undefined },
      { name: 'island', type: 'varchar', nullable: true, defaultValue: undefined },
    ],
  },
  generation: {
    path: '/generation',
    pk: 'timestamp',
    columns: [
      { name: 'timestamp', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'fuel_type', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'generation_mw', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'station', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'island', type: 'varchar', nullable: true, defaultValue: undefined },
    ],
  },
  demand: {
    path: '/demand',
    pk: 'timestamp',
    columns: [
      { name: 'timestamp', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'region', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'demand_mw', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'island', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'trading_period', type: 'integer', nullable: true, defaultValue: undefined },
    ],
  },
  reserves: {
    path: '/reserves',
    pk: 'timestamp',
    columns: [
      { name: 'timestamp', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'island', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'reserve_type', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'price', type: 'decimal', nullable: true, defaultValue: undefined },
      { name: 'quantity_mw', type: 'decimal', nullable: true, defaultValue: undefined },
    ],
  },
  hvdc_flows: {
    path: '/hvdc',
    pk: 'timestamp',
    columns: [
      { name: 'timestamp', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'direction', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'flow_mw', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'pole', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'trading_period', type: 'integer', nullable: true, defaultValue: undefined },
    ],
  },
  node_prices: {
    path: '/prices/nodes',
    pk: 'timestamp',
    columns: [
      { name: 'timestamp', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'node', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'price', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'island', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'region', type: 'varchar', nullable: true, defaultValue: undefined },
    ],
  },
};

@registerSource('nz-ea')
export class NzEaConnector extends BaseConnector {
  private baseUrl = NZ_EA_BASE;
  private apiKey = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;
  private lastWatermark: Record<string, string> = {};

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const nc = config as NzEaConfig;
      this.baseUrl = nc.baseUrl || NZ_EA_BASE;
      this.apiKey = nc.apiKey || '';

      // Test connectivity
      const res = await fetch(`${this.baseUrl}/prices/spot?limit=1`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`NZ EA API error: HTTP ${res.status}`);
      this.connected = true;
    } catch (error) {
      throw new Error(`NZ EA connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/prices/spot?limit=1`, {
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    return Object.keys(TABLE_ENDPOINTS);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = TABLE_ENDPOINTS[table];
    if (!def) return { table, columns: [], primaryKey: [] };
    return { table, columns: def.columns, primaryKey: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const pollMs = (this.config as NzEaConfig)?.pollIntervalMs || 1800000; // 30 min

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const tables = await this.getTables();
        for (const table of tables) {
          const since = this.lastWatermark[table] || new Date(Date.now() - pollMs).toISOString();
          const rows = await this.fetchData(table, since, new Date().toISOString());
          for (const row of rows) {
            callback({ op: 'I', table, before: undefined, after: row, ts: new Date() });
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
    const def = TABLE_ENDPOINTS[table];
    if (!def) throw new Error(`Unknown NZ EA table: ${table}`);
    const events: UnifiedChangeEvent[] = [];

    // Extract last 24 hours in date-range chunks
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 86400000);
    const chunkMs = 3600000; // 1 hour chunks
    let chunkStart = dayAgo;

    while (chunkStart < now) {
      const chunkEnd = new Date(Math.min(chunkStart.getTime() + chunkMs, now.getTime()));
      const rows = await this.fetchData(table, chunkStart.toISOString(), chunkEnd.toISOString());
      for (const row of rows) {
        const pk = `${row.timestamp || ''}_${row.node || row.region || ''}`;
        events.push(createEvent({ operation: "S", name: table, data: row, watermark: String(null || ""), sourceMetadata: pk }));
      }
      chunkStart = chunkEnd;
    }
    this.lastWatermark[table] = now.toISOString();
    return events;
  }

  async extractIncremental(name: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = TABLE_ENDPOINTS[table];
    if (!def) throw new Error(`Unknown NZ EA table: ${table}`);
    const events: UnifiedChangeEvent[] = [];

    const since = watermark || new Date(Date.now() - 1800000).toISOString();
    const until = new Date().toISOString();
    const rows = await this.fetchData(table, since, until);

    for (const row of rows) {
      const ts = row.timestamp || new Date().toISOString();
      events.push(createEvent({ operation: "I", name: table, data: row, watermark: String(null || ""), sourceMetadata: ts }));
    }
    this.lastWatermark[table] = until;
    return events;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (this.apiKey) headers['X-API-Key'] = this.apiKey;
    return headers;
  }

  private async fetchData(
    name: string,
    from: string,
    to: string
  ): Promise<Record<string, any>[]> {
    const def = TABLE_ENDPOINTS[table];
    const params = new URLSearchParams({
      from: from.split('T')[0],
      to: to.split('T')[0],
      limit: this.batchSize.toString(),
    });

    const url = `${this.baseUrl}${def.path}?${params.toString()}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(`NZ EA API error for ${table}: HTTP ${res.status}`);

    const data = await res.json() as any;
    // EM6 API returns data in various shapes
    if (Array.isArray(data)) return data;
    if (data.data) return Array.isArray(data.data) ? data.data : [];
    if (data.results) return data.results;
    if (data.prices) return data.prices;
    if (data.records) return data.records;
    return [];
  }
}






