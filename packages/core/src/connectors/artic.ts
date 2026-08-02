// Art Institute of Chicago API (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('artic')
export class ArtICConnector extends BaseConnector {
  private baseUrl = 'https://api.artic.edu/api/v1';
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
      const res = await fetch(`${this.baseUrl}/artworks?limit=1`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['artworks', 'artists'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'artists') {
      return { table, columns: [
        { name: 'id', type: 'number', nullable: false },
        { name: 'title', type: 'string', nullable: false },
      ], primaryKeys: ['id'] };
    }
    return { table, columns: [
      { name: 'id', type: 'number', nullable: false },
      { name: 'title', type: 'string', nullable: false },
      { name: 'artist_display', type: 'string', nullable: true },
      { name: 'date_display', type: 'string', nullable: true },
      { name: 'medium_display', type: 'string', nullable: true },
    ], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'artists') {
      const res = await fetch(`${this.baseUrl}/artists?limit=5`);
      const data = await res.json();
      return data.data.map((a: any) => createEvent('artic', 'artists', 'c', a, String(a.id)));
    }
    const res = await fetch(`${this.baseUrl}/artworks?limit=5`);
    const data = await res.json();
    return data.data.map((a: any) => createEvent('artic', 'artworks', 'c', a, String(a.id)));
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
