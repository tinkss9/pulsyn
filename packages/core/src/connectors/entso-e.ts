// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface EntsoeConfig extends DatabaseConfig {
  securityToken: string;
  baseUrl?: string;
  areaCode?: string;
  pollIntervalMs?: number;
}

const ENTSOE_BASE = 'https://web-api.tp.entsoe.eu/api';

const DOCUMENT_TYPES: Record<string, string> = {
  ActualTotalLoad: 'A65',
  DayAheadPrices: 'A44',
  ActualGeneration: 'A75',
  CrossBorderFlows: 'A11',
};

const TABLE_SCHEMAS: Record<string, { columns: any[]; pk: string }> = {
  ActualTotalLoad: {
    pk: 'timestamp',
    columns: [
      { name: 'timestamp', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'area', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'quantity', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'resolution', type: 'varchar', nullable: true, defaultValue: undefined },
    ],
  },
  DayAheadPrices: {
    pk: 'timestamp',
    columns: [
      { name: 'timestamp', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'area', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'price', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'currency', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'resolution', type: 'varchar', nullable: true, defaultValue: undefined },
    ],
  },
  ActualGeneration: {
    pk: 'timestamp',
    columns: [
      { name: 'timestamp', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'area', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'production_type', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'quantity', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'resolution', type: 'varchar', nullable: true, defaultValue: undefined },
    ],
  },
  CrossBorderFlows: {
    pk: 'timestamp',
    columns: [
      { name: 'timestamp', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'in_area', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'out_area', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'quantity', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'resolution', type: 'varchar', nullable: true, defaultValue: undefined },
    ],
  },
};

@registerSource('entsoe')
export class EntsoeConnector extends BaseConnector {
  private baseUrl = ENTSOE_BASE;
  private securityToken = '';
  private areaCode = '10YGB----------A'; // Default: GB
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;
  private lastWatermark: Record<string, string> = {};

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const ec = config as EntsoeConfig;
      this.baseUrl = ec.baseUrl || ENTSOE_BASE;
      this.securityToken = ec.securityToken;
      this.areaCode = ec.areaCode || '10YGB----------A';

      if (!this.securityToken) {
        throw new Error('securityToken is required for ENTSO-E API');
      }

      // Test with a lightweight query
      const now = new Date();
      const from = new Date(now.getTime() - 3600000);
      const url = this.buildUrl('ActualTotalLoad', from, now);
      const res = await fetch(url);
      if (!res.ok && res.status !== 400) {
        throw new Error(`ENTSO-E API error: HTTP ${res.status}`);
      }
      this.connected = true;
    } catch (error) {
      throw new Error(`ENTSO-E connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const now = new Date();
      const from = new Date(now.getTime() - 3600000);
      const url = this.buildUrl('ActualTotalLoad', from, now);
      const res = await fetch(url);
      return res.ok;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    return Object.keys(DOCUMENT_TYPES);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schema = TABLE_SCHEMAS[table];
    if (!schema) return { table, columns: [], primaryKey: [] };
    return { table, columns: schema.columns, primaryKey: [schema.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const pollMs = (this.config as EntsoeConfig)?.pollIntervalMs || 900000; // 15min

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const tables = await this.getTables();
        for (const table of tables) {
          const now = new Date();
          const from = this.lastWatermark[table]
            ? new Date(this.lastWatermark[table])
            : new Date(now.getTime() - 3600000);
          const rows = await this.fetchTimeSeries(table, from, now);
          for (const row of rows) {
            callback({ op: 'I', table, before: undefined, after: row, ts: new Date() });
          }
          this.lastWatermark[table] = now.toISOString();
        }
      } catch { /* retry next cycle */ }
    }, pollMs);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!DOCUMENT_TYPES[table]) throw new Error(`Unknown ENTSO-E table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    const now = new Date();
    // Extract last 24 hours for full extract
    const from = new Date(now.getTime() - 86400000);
    const rows = await this.fetchTimeSeries(table, from, now);
    for (const row of rows) {
      events.push(createEvent({ operation: "S", name: table, data: row, watermark: String(null || ""), sourceMetadata: row.timestamp }));
    }
    this.lastWatermark[table] = now.toISOString();
    return events;
  }

  async extractIncremental(name: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!DOCUMENT_TYPES[table]) throw new Error(`Unknown ENTSO-E table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    const now = new Date();
    const from = watermark ? new Date(watermark) : new Date(now.getTime() - 3600000);
    const rows = await this.fetchTimeSeries(table, from, now);
    for (const row of rows) {
      events.push(createEvent({ operation: "I", name: table, data: row, watermark: String(null || ""), sourceMetadata: row.timestamp }));
    }
    this.lastWatermark[table] = now.toISOString();
    return events;
  }

  private buildUrl(name: string, from: Date, to: Date): string {
    const docType = DOCUMENT_TYPES[table];
    const periodStart = this.formatDate(from);
    const periodEnd = this.formatDate(to);
    const params = new URLSearchParams({
      securityToken: this.securityToken,
      documentType: docType,
      processType: 'A16',
      outBiddingZone_Domain: this.areaCode,
      in_Domain: this.areaCode,
      periodStart,
      periodEnd,
    });
    return `${this.baseUrl}?${params.toString()}`;
  }

  private formatDate(d: Date): string {
    return d.toISOString().replace(/[-:T]/g, '').slice(0, 12) + '00';
  }

  private async fetchTimeSeries(name: string, from: Date, to: Date): Promise<Record<string, any>[]> {
    const url = this.buildUrl(table, from, to);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ENTSO-E API error: HTTP ${res.status}`);
    const xml = await res.text();
    return this.parseXmlTimeSeries(xml, table);
  }

  private parseXmlTimeSeries(xml: string, table: string): Record<string, any>[] {
    const rows: Record<string, any>[] = [];
    // Parse TimeSeries blocks
    const seriesPattern = /<TimeSeries>([\s\S]*?)<\/TimeSeries>/g;
    let seriesMatch: RegExpExecArray | null;

    while ((seriesMatch = seriesPattern.exec(xml)) !== null) {
      const series = seriesMatch[1];
      const area = this.extractXml(series, 'outBiddingZone_Domain.mRID') || this.areaCode;
      const resolution = this.extractXml(series, 'resolution') || 'PT60M';
      const startStr = this.extractXml(series, 'start');
      const start = startStr ? new Date(startStr) : new Date();

      // Parse periods and points
      const pointPattern = /<Point>([\s\S]*?)<\/Point>/g;
      let pointMatch: RegExpExecArray | null;
      const resMinutes = resolution.includes('15') ? 15 : resolution.includes('30') ? 30 : 60;

      while ((pointMatch = pointPattern.exec(series)) !== null) {
        const point = pointMatch[1];
        const position = parseInt(this.extractXml(point, 'position') || '1', 10);
        const quantity = parseFloat(this.extractXml(point, 'quantity') || '0');
        const price = parseFloat(this.extractXml(point, 'price.amount') || '0');
        const ts = new Date(start.getTime() + (position - 1) * resMinutes * 60000);

        const row: Record<string, any> = {
          timestamp: ts.toISOString(),
          area,
          resolution,
        };
        if (table === 'DayAheadPrices') {
          row.price = price || quantity;
          row.currency = this.extractXml(series, 'currency_Unit.name') || 'EUR';
        } else {
          row.quantity = quantity;
        }
        if (table === 'ActualGeneration') {
          row.production_type = this.extractXml(series, 'MktPSRType>psrType') || 'unknown';
        }
        if (table === 'CrossBorderFlows') {
          row.in_area = this.extractXml(series, 'in_Domain.mRID') || '';
          row.out_area = this.extractXml(series, 'out_Domain.mRID') || '';
        }
        rows.push(row);
      }
    }
    return rows;
  }

  private extractXml(xml: string, tag: string): string | null {
    const simpleTag = tag.split('>').pop() || tag;
    const pattern = new RegExp(`<${simpleTag}[^>]*>([^<]+)</${simpleTag}>`, 'i');
    const match = pattern.exec(xml);
    return match ? match[1].trim() : undefined;
  }
}






