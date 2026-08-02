// Dog CEO API — Random dog images by breed (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('dogceo')
export class DogCEOConnector extends BaseConnector {
  private baseUrl = 'https://dog.ceo/api';
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
      const res = await fetch(`${this.baseUrl}/breeds/list/all`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['breeds', 'images'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'breeds') {
      return { table, columns: [
        { name: 'breed', type: 'string', nullable: false },
        { name: 'subBreeds', type: 'array', nullable: true },
      ], primaryKeys: ['breed'] };
    }
    return { table, columns: [
      { name: 'url', type: 'string', nullable: false },
    ], primaryKeys: [] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'breeds') {
      const res = await fetch(`${this.baseUrl}/breeds/list/all`);
      const data = await res.json();
      return Object.entries(data.message).map(([breed, subs]) =>
        createEvent({ op: 'S', table: 'breeds', after: { breed, watermark: subBreeds: subs }, breed })
      );
    }
    const res = await fetch(`${this.baseUrl}/breeds/image/random/5`);
    const data = await res.json();
    return (data.message as string[]).map((url, i) =>
      createEvent({ op: 'S', table: 'images', after: { url }, watermark: String(i )))
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
