// Exchange Rates API — open.er-api.com (No Auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('exchangerate')
export class ExchangeRateConnector extends BaseConnector {
  private baseUrl = 'https://open.er-api.com/v6';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const res = await fetch(`${this.baseUrl}/latest/USD`);
    if (!res.ok) throw new Error(`exchangerate connection failed: HTTP ${res.status}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/latest/USD`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    if (!this.connected) throw new Error('Not connected');
    return ['rates'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'base_code', type: 'string', nullable: false },
        { name: 'conversion_rates', type: 'object', nullable: false },
      ],
      primaryKeys: ['base_code'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.connected) throw new Error('Not connected');
    const currencies = ['USD', 'EUR', 'GBP'];
    const events: UnifiedChangeEvent[] = [];
    for (const base of currencies) {
      const res = await fetch(`${this.baseUrl}/latest/${base}`);
      if (!res.ok) continue;
      const data = await res.json();
      events.push(createEvent({ op: 'S', table: 'rates', after: data, watermark: base }));
    }
    return events;
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
