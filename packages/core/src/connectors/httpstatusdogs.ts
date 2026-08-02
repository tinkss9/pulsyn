// HTTP Status Dogs API — Dogs for HTTP status codes (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('httpstatusdogs')
export class HTTPStatusDogsConnector extends BaseConnector {
  private baseUrl = 'https://http.dog';
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
      const res = await fetch(`${this.baseUrl}/200.json`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['status_codes'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'statusCode', type: 'number', nullable: false },
        { name: 'description', type: 'string', nullable: false },
        { name: 'image', type: 'string', nullable: false },
      ],
      primaryKeys: ['statusCode'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const codes = [200, 301, 404, 500];
    const events: UnifiedChangeEvent[] = [];
    for (const code of codes) {
      const res = await fetch(`${this.baseUrl}/${code}.json`);
      if (res.ok) {
        const data = await res.json();
        events.push(createEvent({ op: 'S', table: 'status_codes', after: data, watermark: String(code) }));
      }
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
