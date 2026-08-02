// REST Countries API — No auth required
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('restcountries')
export class RestCountriesConnector extends BaseConnector {
  private baseUrl = 'https://restcountries.com/v3.1';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const res = await fetch(`${this.baseUrl}/alpha/US`);
    if (!res.ok) throw new Error(`restcountries connection failed: HTTP ${res.status}`);
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
    if (!this.connected) throw new Error('Not connected');
    return ['countries'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'cca3', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'capital', type: 'string', nullable: true },
        { name: 'region', type: 'string', nullable: true },
        { name: 'population', type: 'number', nullable: true },
      ],
      primaryKeys: ['cca3'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.connected) throw new Error('Not connected');
    const res = await fetch(`${this.baseUrl}/all?fields=name,capital,region,population,cca3`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.slice(0, 20).map((c: any) =>
      createEvent({ op: 'S', table: 'countries', after: {
        cca3: c.cca3,
        name: c.name?.common || '',
        capital: c.capital?.[0] || '',
        region: c.region || '',
        population: c.population || 0,
      }, watermark: c.cca3 })
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
