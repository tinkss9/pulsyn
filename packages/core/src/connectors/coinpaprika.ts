// Coinpaprika API — Crypto data (no auth, free tier)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('coinpaprika')
export class CoinpaprikaConnector extends BaseConnector {
  private baseUrl = 'https://api.coinpaprika.com/v1';
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
      const res = await fetch(`${this.baseUrl}/coins?limit=1`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['coins', 'global'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'global') {
      return { table, columns: [
        { name: 'market_cap_usd', type: 'number', nullable: false },
        { name: 'volume_24h_usd', type: 'number', nullable: false },
        { name: 'bitcoin_dominance_percentage', type: 'number', nullable: false },
        { name: 'active_cryptocurrencies', type: 'number', nullable: false },
      ], primaryKeys: [] };
    }
    return { table, columns: [
      { name: 'id', type: 'string', nullable: false },
      { name: 'symbol', type: 'string', nullable: false },
      { name: 'name', type: 'string', nullable: false },
      { name: 'rank', type: 'number', nullable: false },
      { name: 'type', type: 'string', nullable: false },
    ], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'global') {
      const res = await fetch(`${this.baseUrl}/global`);
      const data = await res.json();
      return [createEvent({ op: 'S', table: 'global', after: data, watermark: 'global' })];
    }
    const res = await fetch(`${this.baseUrl}/coins?limit=5`);
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
