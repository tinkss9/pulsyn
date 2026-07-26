// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface ErcotConfig extends DatabaseConfig {
  subscriptionKey: string;
  baseUrl?: string;
  pollIntervalMs?: number;
}

const ERCOT_BASE = 'https://apiexplorer.ercot.com/api/public-reports';

const TABLE_ENDPOINTS: Record<string, string> = {
  RTM_SPP: '/np6-905-cd/spp_node_zone_hub',
  DAM_SPP: '/np4-190-cd/dam_spp_node_zone_hub',
  GENERATION_MIX: '/np3-565-cd/fuel_mix',
  SYSTEM_LOAD: '/np6-345-cd/act_sys_load_by_wzn',
  WIND_FORECAST: '/np4-742-cd/wpp_hrly_avrg_actl_fcast',
};

const TABLE_SCHEMAS: Record<string, { columns: any[]; pk: string }> = {
  RTM_SPP: {
    pk: 'deliveryDate',
    columns: [
      { name: 'deliveryDate', type: 'date', nullable: false, defaultValue: undefined },
      { name: 'deliveryHour', type: 'integer', nullable: false, defaultValue: undefined },
      { name: 'deliveryInterval', type: 'integer', nullable: false, defaultValue: undefined },
      { name: 'settlementPoint', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'settlementPointPrice', type: 'decimal', nullable: false, defaultValue: undefined },
    ],
  },
  DAM_SPP: {
    pk: 'deliveryDate',
    columns: [
      { name: 'deliveryDate', type: 'date', nullable: false, defaultValue: undefined },
      { name: 'deliveryHour', type: 'integer', nullable: false, defaultValue: undefined },
      { name: 'settlementPoint', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'settlementPointPrice', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'settlementPointType', type: 'varchar', nullable: true, defaultValue: undefined },
    ],
  },
  GENERATION_MIX: {
    pk: 'timestamp',
    columns: [
      { name: 'timestamp', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'fuelType', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'generation', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'percentage', type: 'decimal', nullable: true, defaultValue: undefined },
    ],
  },
  SYSTEM_LOAD: {
    pk: 'deliveryDate',
    columns: [
      { name: 'deliveryDate', type: 'date', nullable: false, defaultValue: undefined },
      { name: 'deliveryHour', type: 'integer', nullable: false, defaultValue: undefined },
      { name: 'weatherZone', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'systemLoad', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'dstFlag', type: 'boolean', nullable: true, defaultValue: undefined },
    ],
  },
  WIND_FORECAST: {
    pk: 'deliveryDate',
    columns: [
      { name: 'deliveryDate', type: 'date', nullable: false, defaultValue: undefined },
      { name: 'deliveryHour', type: 'integer', nullable: false, defaultValue: undefined },
      { name: 'actual', type: 'decimal', nullable: true, defaultValue: undefined },
      { name: 'forecast', type: 'decimal', nullable: true, defaultValue: undefined },
      { name: 'copHse', type: 'decimal', nullable: true, defaultValue: undefined },
    ],
  },
};

@registerSource('ercot')
export class ErcotConnector extends BaseConnector {
  private baseUrl = ERCOT_BASE;
  private subscriptionKey = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;
  private lastWatermark: Record<string, string> = {};

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const ec = config as ErcotConfig;
      this.baseUrl = ec.baseUrl || ERCOT_BASE;
      this.subscriptionKey = ec.subscriptionKey;

      if (!this.subscriptionKey) {
        throw new Error('Ocp-Apim-Subscription-Key is required for ERCOT API');
      }

      const res = await fetch(`${this.baseUrl}${TABLE_ENDPOINTS.SYSTEM_LOAD}?size=1`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`ERCOT API error: HTTP ${res.status}`);
      this.connected = true;
    } catch (error) {
      throw new Error(`ERCOT connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}${TABLE_ENDPOINTS.SYSTEM_LOAD}?size=1`, {
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
    const schema = TABLE_SCHEMAS[table];
    if (!schema) return { table, columns: [], primaryKey: [] };
    return { table, columns: schema.columns, primaryKey: [schema.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const pollMs = (this.config as ErcotConfig)?.pollIntervalMs || 300000; // 5 min

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const tables = await this.getTables();
        for (const table of tables) {
          const rows = await this.fetchPage(table, 0, 100, this.lastWatermark[table]);
          for (const row of rows) {
            callback({ op: 'I', table, before: undefined, after: row, ts: new Date() });
          }
          if (rows.length > 0) {
            this.lastWatermark[table] = new Date().toISOString();
          }
        }
      } catch { /* retry next cycle */ }
    }, pollMs);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!TABLE_ENDPOINTS[table]) throw new Error(`Unknown ERCOT table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let page = 0;
    const pageSize = this.batchSize;

    while (true) {
      const rows = await this.fetchPage(table, page, pageSize);
      if (rows.length === 0) break;

      for (const row of rows) {
        const pk = `${row.deliveryDate || row.timestamp}_${row.deliveryHour || ''}`;
        events.push(createEvent({ operation: "S", name: table, data: row, watermark: String(null || ""), sourceMetadata: pk }));
      }
      if (rows.length < pageSize) break;
      page++;
    }
    this.lastWatermark[table] = new Date().toISOString();
    return events;
  }

  async extractIncremental(name: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!TABLE_ENDPOINTS[table]) throw new Error(`Unknown ERCOT table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    const rows = await this.fetchPage(table, 0, this.batchSize, watermark);
    for (const row of rows) {
      const ts = row.deliveryDate || row.timestamp || new Date().toISOString();
      events.push(createEvent({ operation: "I", name: table, data: row, watermark: String(null || ""), sourceMetadata: ts }));
    }
    this.lastWatermark[table] = new Date().toISOString();
    return events;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Ocp-Apim-Subscription-Key': this.subscriptionKey,
      'Accept': 'application/json',
    };
  }

  private async fetchPage(
    name: string,
    page: number,
    size: number,
    since?: string | null
  ): Promise<Record<string, any>[]> {
    const endpoint = TABLE_ENDPOINTS[table];
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (since) {
      params.set('deliveryDateFrom', since.split('T')[0]);
    }

    const url = `${this.baseUrl}${endpoint}?${params.toString()}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(`ERCOT API error for ${table}: HTTP ${res.status}`);

    const data = await res.json() as any;
    // ERCOT returns { data: [...], ...meta }
    return data.data || data.results || data.records || [];
  }
}






