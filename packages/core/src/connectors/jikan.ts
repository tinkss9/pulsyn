// Jikan API — MyAnimeList unofficial (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('jikan')
export class JikanConnector extends BaseConnector {
  private baseUrl = 'https://api.jikan.moe/v4';
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
      const res = await fetch(`${this.baseUrl}/anime?limit=1`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['anime', 'manga', 'genres'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'genres') {
      return { table, columns: [
        { name: 'mal_id', type: 'number', nullable: false },
        { name: 'name', type: 'string', nullable: false },
      ], primaryKeys: ['mal_id'] };
    }
    return { table, columns: [
      { name: 'mal_id', type: 'number', nullable: false },
      { name: 'title', type: 'string', nullable: false },
      { name: 'type', type: 'string', nullable: true },
      { name: 'score', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
    ], primaryKeys: ['mal_id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'genres') {
      const res = await fetch(`${this.baseUrl}/genres/anime`);
      const data = await res.json();
      return data.data.slice(0, 10).map((g: any) =>
        createEvent('jikan', 'genres', 'c', g, String(g.mal_id))
      );
    }
    const endpoint = table === 'manga' ? 'manga' : 'anime';
    const res = await fetch(`${this.baseUrl}/${endpoint}?limit=5&order_by=score&sort=desc`);
    const data = await res.json();
    return data.data.map((a: any) => createEvent('jikan', table, 'c', a, String(a.mal_id)));
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
