// Public Holidays API — global holidays (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('openholidays')
export class OpenHolidaysConnector extends BaseConnector {
  private baseUrl = 'https://openholidaysapi.org';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/PublicHolidays?countryIsoCode=DE&languageIsoCode=DE&validFrom=2024-01-01&validTo=2024-12-31`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['holidays', 'countries'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'countries') {
      return { table, columns: [
        { name: 'isoCode', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
      ], primaryKeys: ['isoCode'] };
    }
    return { table, columns: [
      { name: 'id', type: 'string', nullable: false },
      { name: 'startDate', type: 'string', nullable: false },
      { name: 'endDate', type: 'string', nullable: false },
      { name: 'type', type: 'string', nullable: false },
    ], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'countries') {
      const res = await fetch(`${this.baseUrl}/Countries?languageIsoCode=EN`);
      const data = await res.json();
      return data.slice(0, 10).map((c: any) =>
        createEvent('openholidays', 'countries', 'c', { isoCode: c.isoCode, name: c.name?.[0]?.text }, c.isoCode)
      );
    }
    const res = await fetch(`${this.baseUrl}/PublicHolidays?countryIsoCode=DE&languageIsoCode=DE&validFrom=2024-01-01&validTo=2024-12-31`);
    const data = await res.json();
    return data.slice(0, 10).map((h: any) =>
      createEvent('openholidays', 'holidays', 'c', h, h.id)
    );
  }

  async extractIncremental(table: string): Promise<UnifiedChangeEvent[]> {
    return [];
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
  }
}
