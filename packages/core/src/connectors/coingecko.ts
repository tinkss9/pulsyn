// CoinGecko API — Crypto prices (no auth, free tier)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('coingecko')
export class CoinGeckoConnector extends BaseConnector {
  private baseUrl = 'https://api.coingecko.com/api/v3';
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
      const res = await fetch(`${this.baseUrl}/ping`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['coins', 'exchange_rates'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'exchange_rates') {
      return { table, columns: [
        { name: 'name', type: 'string', nullable: false },
        { name: 'unit', type: 'string', nullable: false },
        { name: 'value', type: 'number', nullable: false },
        { name: 'type', type: 'string', nullable: false },
      ], primaryKeys: ['name'] };
    }
    return { table, columns: [
      { name: 'id', type: 'string', nullable: false },
      { name: 'symbol', type: 'string', nullable: false },
      { name: 'name', type: 'string', nullable: false },
      { name: 'current_price', type: 'number', nullable: true },
      { name: 'market_cap', type: 'number', nullable: true },
    ], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'exchange_rates') {
      const res = await fetch(`${this.baseUrl}/exchange_rates`);
      const data = await res.json();
      return Object.entries(data.rates).slice(0, 10).map(([name, rate]: [string, any]) =>
        createEvent({ op: 'S', table: 'exchange_rates', after: { name, watermark: ...rate }, name })
      );
    }
    const res = await fetch(`${this.baseUrl}/coins/markets?vs_currency=usd&per_page=5&page=1`);
    const data = await res.json();
    return data.map((c: any) => createEvent({ op: 'S', table: 'coins', after: c, watermark: c.id }));
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
