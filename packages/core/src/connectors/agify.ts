// Agify API — Age estimation from name (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('agify')
export class AgifyConnector extends BaseConnector {
  private baseUrl = 'https://api.agify.io';
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
      const res = await fetch(`${this.baseUrl}?name=michael`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['predictions'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'name', type: 'string', nullable: false },
        { name: 'age', type: 'number', nullable: true },
        { name: 'count', type: 'number', nullable: false },
      ],
      primaryKeys: ['name'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    for (const name of ['michael', 'emma', 'james', 'sarah', 'david']) {
      const res = await fetch(`${this.baseUrl}?name=${name}`);
      const data = await res.json();
      events.push(createEvent('agify', 'predictions', 'c', data, data.name));
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
