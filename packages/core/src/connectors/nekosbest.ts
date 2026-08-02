// Nekos Best API — Anime neko images (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('nekosbest')
export class NekosBestConnector extends BaseConnector {
  private baseUrl = 'https://nekos.best/api/v2';
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
      const res = await fetch(`${this.baseUrl}/neko`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['images', 'endpoints'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'endpoints') {
      return { table, columns: [
        { name: 'name', type: 'string', nullable: false },
        { name: 'min', type: 'number', nullable: false },
        { name: 'max', type: 'number', nullable: false },
      ], primaryKeys: ['name'] };
    }
    return { table, columns: [
      { name: 'url', type: 'string', nullable: false },
      { name: 'anime_name', type: 'string', nullable: true },
    ], primaryKeys: [] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'endpoints') {
      const res = await fetch(`${this.baseUrl}/endpoints`);
      const data = await res.json();
      return Object.entries(data).map(([name, info]: [string, any]) =>
        createEvent('nekosbest', 'endpoints', 'c', { name, ...info }, name)
      );
    }
    const res = await fetch(`${this.baseUrl}/neko`);
    const data = await res.json();
    return data.results.map((r: any, i: number) =>
      createEvent('nekosbest', 'images', 'c', r, String(i))
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
