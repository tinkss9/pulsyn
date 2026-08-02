// Cat Facts API Connector — catfact.ninja (No Auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('catfacts')
export class CatFactsConnector extends BaseConnector {
  private baseUrl = 'https://catfact.ninja';
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
      const res = await fetch(`${this.baseUrl}/fact`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['facts'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'fact', type: 'string', nullable: false },
        { name: 'length', type: 'number', nullable: false },
      ],
      primaryKeys: [],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${this.baseUrl}/fact`);
      const data = await res.json();
      events.push(createEvent({ op: 'S', table: 'facts', after: data, watermark: String(i) }));
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
