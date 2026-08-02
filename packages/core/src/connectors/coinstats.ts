// CoinStats API — Crypto tracker (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('coinstats')
export class CoinStatsConnector extends BaseConnector {
  private baseUrl = 'https://api.coinstats.app/v1';
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
    return ['coins', 'exchanges'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'exchanges') {
      return { table, columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'volume', type: 'number', nullable: true },
      ], primaryKeys: ['id'] };
    }
    return { table, columns: [
      { name: 'id', type: 'string', nullable: false },
      { name: 'symbol', type: 'string', nullable: false },
      { name: 'name', type: 'string', nullable: false },
      { name: 'price', type: 'number', nullable: true },
      { name: 'marketCap', type: 'number', nullable: true },
    ], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'exchanges') {
      const res = await fetch(`${this.baseUrl}/exchanges`);
      const data = await res.json();
      return data.exchanges.slice(0, 5).map((e: any) =>
        createEvent('coinstats', 'exchanges', 'c', e, e.id)
      );
    }
    const res = await fetch(`${this.baseUrl}/coins?limit=5`);
    const data = await res.json();
    return data.coins.map((c: any) => createEvent('coinstats', 'coins', 'c', c, c.id));
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
