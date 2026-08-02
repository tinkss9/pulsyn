// Nager.Date API — Public holidays (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('nagerdate')
export class NagerDateConnector extends BaseConnector {
  private baseUrl = 'https://date.nager.at/api/v3';
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
      const res = await fetch(`${this.baseUrl}/PublicHolidays/2024/US`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['holidays', 'countries'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'countries') {
      return { table, columns: [
        { name: 'countryCode', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
      ], primaryKeys: ['countryCode'] };
    }
    return { table, columns: [
      { name: 'date', type: 'string', nullable: false },
      { name: 'localName', type: 'string', nullable: false },
      { name: 'name', type: 'string', nullable: false },
      { name: 'countryCode', type: 'string', nullable: false },
      { name: 'fixed', type: 'boolean', nullable: false },
    ], primaryKeys: ['date'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'countries') {
      const res = await fetch(`${this.baseUrl}/AvailableCountries`);
      const data = await res.json();
      return data.slice(0, 20).map((c: any) =>
        createEvent({ op: 'S', table: 'countries', after: c, watermark: c.countryCode })
      );
    }
    const res = await fetch(`${this.baseUrl}/PublicHolidays/2024/US`);
    const data = await res.json();
    return data.slice(0, 10).map((h: any) =>
      createEvent({ op: 'S', table: 'holidays', after: h, watermark: h.date })
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
