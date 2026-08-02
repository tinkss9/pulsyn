// Random Fox API — Random fox images (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('randomfox')
export class RandomFoxConnector extends BaseConnector {
  private baseUrl = 'https://randomfox.ca';
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
      const res = await fetch(`${this.baseUrl}/floof/`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['foxes'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'image', type: 'string', nullable: false },
        { name: 'link', type: 'string', nullable: false },
      ],
      primaryKeys: [],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${this.baseUrl}/floof/`);
      const data = await res.json();
      events.push(createEvent({ op: 'S', table: 'foxes', after: data, watermark: String(i) }));
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
