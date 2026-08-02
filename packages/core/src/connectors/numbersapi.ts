// Numbers API — Trivia and math facts (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('numbersapi')
export class NumbersAPIConnector extends BaseConnector {
  private baseUrl = 'http://numbersapi.com';
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
      const res = await fetch(`${this.baseUrl}/1?json`);
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
        { name: 'number', type: 'number', nullable: false },
        { name: 'text', type: 'string', nullable: false },
        { name: 'type', type: 'string', nullable: false },
        { name: 'found', type: 'boolean', nullable: false },
      ],
      primaryKeys: ['number'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    for (const num of [1, 2, 3, 4, 5]) {
      const res = await fetch(`${this.baseUrl}/${num}?json`);
      const data = await res.json();
      events.push(createEvent({ op: 'S', table: 'facts', after: data, watermark: String(data.number) }));
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
