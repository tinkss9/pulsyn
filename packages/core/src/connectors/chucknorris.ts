// Chuck Norris API — Random Chuck Norris jokes (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('chucknorris')
export class ChuckNorrisConnector extends BaseConnector {
  private baseUrl = 'https://api.chucknorris.io';
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
      const res = await fetch(`${this.baseUrl}/jokes/random`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['jokes', 'categories'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'categories') {
      return { table, columns: [
        { name: 'name', type: 'string', nullable: false },
      ], primaryKeys: ['name'] };
    }
    return { table, columns: [
      { name: 'id', type: 'string', nullable: false },
      { name: 'value', type: 'string', nullable: false },
      { name: 'url', type: 'string', nullable: false },
      { name: 'categories', type: 'array', nullable: true },
    ], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'categories') {
      const res = await fetch(`${this.baseUrl}/jokes/categories`);
      const data = await res.json();
      return data.map((cat: string) => createEvent({ op: 'S', table: 'categories', after: { name: cat }, watermark: cat }));
    }
    const events: UnifiedChangeEvent[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${this.baseUrl}/jokes/random`);
      const data = await res.json();
      events.push(createEvent({ op: 'S', table: 'jokes', after: data, watermark: data.id }));
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
