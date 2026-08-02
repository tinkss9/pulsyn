// Quotable API — Famous quotes (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('quotable')
export class QuotableConnector extends BaseConnector {
  private baseUrl = 'https://api.quotable.io';
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
      const res = await fetch(`${this.baseUrl}/quotes/random`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['quotes', 'authors'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'authors') {
      return { table, columns: [
        { name: '_id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'bio', type: 'string', nullable: true },
      ], primaryKeys: ['_id'] };
    }
    return { table, columns: [
      { name: '_id', type: 'string', nullable: false },
      { name: 'content', type: 'string', nullable: false },
      { name: 'author', type: 'string', nullable: false },
      { name: 'tags', type: 'array', nullable: true },
    ], primaryKeys: ['_id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'authors') {
      const res = await fetch(`${this.baseUrl}/authors?limit=5`);
      const data = await res.json();
      return data.results.map((a: any) => createEvent('quotable', 'authors', 'c', a, a._id));
    }
    const res = await fetch(`${this.baseUrl}/quotes?limit=5`);
    const data = await res.json();
    return data.results.map((q: any) => createEvent('quotable', 'quotes', 'c', q, q._id));
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
