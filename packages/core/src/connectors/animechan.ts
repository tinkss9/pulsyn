// AnimeChan API — Anime quotes (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('animechan')
export class AnimeChanConnector extends BaseConnector {
  private baseUrl = 'https://animechan.io/api';
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
      const res = await fetch(`${this.baseUrl}/quotes`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['quotes'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'anime', type: 'string', nullable: false },
        { name: 'character', type: 'string', nullable: false },
        { name: 'quote', type: 'string', nullable: false },
      ],
      primaryKeys: [],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`${this.baseUrl}/quotes`);
    const data = await res.json();
    const quotes = data.data || data;
    return (Array.isArray(quotes) ? quotes.slice(0, 5) : []).map((q: any, i: number) =>
      createEvent('animechan', 'quotes', 'c', q, String(i))
    );
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
