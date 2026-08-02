// Waifu Pics API — Anime waifu images (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('waifupics')
export class WaifuPicsConnector extends BaseConnector {
  private baseUrl = 'https://api.waifu.pics';
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
      const res = await fetch(`${this.baseUrl}/sfw/neko`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['sfw_images', 'categories'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'categories') {
      return { table, columns: [
        { name: 'name', type: 'string', nullable: false },
      ], primaryKeys: ['name'] };
    }
    return { table, columns: [
      { name: 'url', type: 'string', nullable: false },
    ], primaryKeys: [] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'categories') {
      const res = await fetch(`${this.baseUrl}/endpoints`);
      const data = await res.json();
      return (data.sfw || []).map((cat: string) =>
        createEvent('waifupics', 'categories', 'c', { name: cat }, cat)
      );
    }
    const res = await fetch(`${this.baseUrl}/sfw/neko`);
    const data = await res.json();
    return [createEvent('waifupics', 'sfw_images', 'c', data, '0')];
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
