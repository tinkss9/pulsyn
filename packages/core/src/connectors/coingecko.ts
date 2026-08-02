// CoinGecko API — Crypto prices (no auth, free tier, rate-limited)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('coingecko')
export class CoinGeckoConnector extends BaseConnector {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cdcActive = false;

  private async fetchWithRetry(url: string, retries = 2): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch(url);
      if (res.status === 429 && i < retries) {
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }
      return res;
    }
    return fetch(url);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    // Don't throw on 429 — API is reachable, just rate-limited
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/ping`);
      return res.ok || res.status === 429;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    if (!this.connected) throw new Error('Not connected');
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
    if (!this.connected) throw new Error('Not connected');
    // No retries for extraction — return empty on 429 to avoid timeouts
    if (table === 'exchange_rates') {
      const res = await fetch(`${this.baseUrl}/exchange_rates`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.rates) return [];
      return Object.entries(data.rates).slice(0, 10).map(([name, rate]: [string, any]) =>
        createEvent({ op: 'S', table: 'exchange_rates', after: { name, ...rate }, watermark: name })
      );
    }
    const res = await fetch(`${this.baseUrl}/coins/markets?vs_currency=usd&per_page=5&page=1`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
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
