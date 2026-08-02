// RestCountries V3 API (alt — more tables)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('countriesv3')
export class CountriesV3Connector extends BaseConnector {
  private baseUrl = 'https://restcountries.com/v3.1';
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
      const res = await fetch(`${this.baseUrl}/alpha/US`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['countries', 'regions', 'currencies'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'regions') {
      return { table, columns: [
        { name: 'region', type: 'string', nullable: false },
        { name: 'count', type: 'number', nullable: false },
      ], primaryKeys: ['region'] };
    }
    if (table === 'currencies') {
      return { table, columns: [
        { name: 'code', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'symbol', type: 'string', nullable: true },
      ], primaryKeys: ['code'] };
    }
    return { table, columns: [
      { name: 'cca2', type: 'string', nullable: false },
      { name: 'name', type: 'string', nullable: false },
      { name: 'capital', type: 'string', nullable: true },
      { name: 'region', type: 'string', nullable: false },
      { name: 'population', type: 'number', nullable: false },
    ], primaryKeys: ['cca2'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'regions') {
      const res = await fetch(`${this.baseUrl}/all?fields=region`);
      const data = await res.json();
      const regionMap = new Map<string, number>();
      for (const c of data) { regionMap.set(c.region, (regionMap.get(c.region) || 0) + 1); }
      return Array.from(regionMap.entries()).map(([region, count]) =>
        createEvent({ op: 'S', table: 'regions', after: { region, watermark: count }, region })
      );
    }
    if (table === 'currencies') {
      const res = await fetch(`${this.baseUrl}/all?fields=currencies`);
      const data = await res.json();
      const currMap = new Map<string, any>();
      for (const c of data) {
        if (c.currencies) {
          for (const [code, info] of Object.entries(c.currencies)) {
            if (!currMap.has(code)) currMap.set(code, { code, ...(info as any) });
          }
        }
      }
      return Array.from(currMap.values()).slice(0, 20).map((c: any) =>
        createEvent({ op: 'S', table: 'currencies', after: c, watermark: c.code })
      );
    }
    const res = await fetch(`${this.baseUrl}/all?fields=name,capital,region,population,cca2`);
    const data = await res.json();
    return data.slice(0, 20).map((c: any) =>
      createEvent({ op: 'S', table: 'countries', after: {
        cca2: c.cca2, watermark: name: c.name?.common, capital: c.capital?.[0], region: c.region, population: c.population,
      }, c.cca2 })
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
