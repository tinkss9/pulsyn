// CoinCap API — Crypto prices (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('coincap')
export class CoinCapConnector extends BaseConnector {
  private baseUrl = 'https://api.coincap.io/v2';
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
      const res = await fetch(`${this.baseUrl}/assets?limit=1`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['assets', 'exchanges'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'exchanges') {
      return { table, columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'volumeUsd24Hr', type: 'number', nullable: true },
      ], primaryKeys: ['id'] };
    }
    return { table, columns: [
      { name: 'id', type: 'string', nullable: false },
      { name: 'symbol', type: 'string', nullable: false },
      { name: 'name', type: 'string', nullable: false },
      { name: 'priceUsd', type: 'string', nullable: true },
      { name: 'marketCapUsd', type: 'string', nullable: true },
    ], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const endpoint = table === 'exchanges' ? 'exchanges' : 'assets';
    const res = await fetch(`${this.baseUrl}/${endpoint}?limit=5`);
    const data = await res.json();
    return data.data.map((item: any) => createEvent('coincap', table, 'c', item, item.id));
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
