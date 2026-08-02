// Bored API — Random activity suggestions (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('boredapi')
export class BoredAPIConnector extends BaseConnector {
  private baseUrl = 'https://www.boredapi.com/api';
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
      const res = await fetch(`${this.baseUrl}/activity`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['activity'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'activity', type: 'string', nullable: false },
        { name: 'type', type: 'string', nullable: false },
        { name: 'participants', type: 'number', nullable: false },
        { name: 'price', type: 'number', nullable: false },
        { name: 'key', type: 'string', nullable: false },
        { name: 'accessibility', type: 'number', nullable: false },
      ],
      primaryKeys: ['key'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${this.baseUrl}/activity`);
      const data = await res.json();
      events.push(createEvent('boredapi', 'activity', 'c', data, data.key));
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
