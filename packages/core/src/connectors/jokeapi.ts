// JokeAPI — Programming and general jokes (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('jokeapi')
export class JokeAPIConnector extends BaseConnector {
  private baseUrl = 'https://v2.jokeapi.dev';
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
      const res = await fetch(`${this.baseUrl}/joke/Any`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['jokes'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'id', type: 'number', nullable: false },
        { name: 'type', type: 'string', nullable: false },
        { name: 'joke', type: 'string', nullable: true },
        { name: 'setup', type: 'string', nullable: true },
        { name: 'delivery', type: 'string', nullable: true },
        { name: 'category', type: 'string', nullable: false },
      ],
      primaryKeys: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${this.baseUrl}/joke/Any`);
      const data = await res.json();
      events.push(createEvent('jokeapi', 'jokes', 'c', data, String(data.id)));
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
