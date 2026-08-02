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
    // Validate connection — treat 402/429 as "reachable but rate-limited"
    const res = await fetch(`${this.baseUrl}/coins?limit=1`);
    if (!res.ok && res.status !== 402 && res.status !== 429) throw new Error(`coinpaprika connection failed: HTTP ${res.status}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/coins?limit=1`);
      return res.ok || res.status === 402 || res.status === 429;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    if (!this.connected) throw new Error('Not connected');
    return ['coins', 'global'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schemas: Record<string, TableSchema> = {
      global: { table, columns: [
        { name: 'market_cap_usd', type: 'number', nullable: false },
        { name: 'volume_24h_usd', type: 'number', nullable: false },
        { name: 'bitcoin_dominance_percentage', type: 'number', nullable: false },
        { name: 'active_cryptocurrencies', type: 'number', nullable: false },
      ], primaryKeys: [] },
      coins: { table, columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'symbol', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'rank', type: 'number', nullable: false },
        { name: 'type', type: 'string', nullable: false },
      ], primaryKeys: ['id'] },
    };
    return schemas[table] || schemas.coins;
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.connected) throw new Error('Not connected');
    try {
    if (table === 'global') {
      const res = await fetch(`${this.baseUrl}/global`);
      if (!res.ok) return [];
      const data = await res.json();
      return [createEvent({ op: 'S', table: 'global', after: data, watermark: 'global' })];
    }
    if (table !== 'coins') throw new Error(`Table '${table}' not found`);
    const res = await fetch(`${this.baseUrl}/coins?limit=5`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((c: any) => createEvent({ op: 'S', table: 'coins', after: c, watermark: c.id }));
    } catch { return []; }
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
