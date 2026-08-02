// Frankfurter API — Exchange rates from ECB (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('frankfurter')
export class FrankfurterConnector extends BaseConnector {
  private baseUrl = 'https://api.frankfurter.app';
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
      const res = await fetch(`${this.baseUrl}/latest`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['latest', 'currencies'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'currencies') {
      return { table, columns: [
        { name: 'code', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
      ], primaryKeys: ['code'] };
    }
    return { table, columns: [
      { name: 'base', type: 'string', nullable: false },
      { name: 'date', type: 'string', nullable: false },
      { name: 'rates', type: 'object', nullable: false },
    ], primaryKeys: ['base'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'currencies') {
      const res = await fetch(`${this.baseUrl}/currencies`);
      const data = await res.json();
      return Object.entries(data).map(([code, name]) =>
        createEvent({ op: 'S', table: 'currencies', after: { code, watermark: name }, code })
      );
    }
    const res = await fetch(`${this.baseUrl}/latest?base=USD`);
    const data = await res.json();
    return [createEvent({ op: 'S', table: 'latest', after: data, watermark: 'USD' })];
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
