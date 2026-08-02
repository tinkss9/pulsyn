// Open Library API — No auth required
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('openlibrary')
export class OpenLibraryConnector extends BaseConnector {
  private baseUrl = 'https://openlibrary.org';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const res = await fetch(`${this.baseUrl}/subjects/fantasy.json?limit=1`);
    if (!res.ok) throw new Error(`openlibrary connection failed: HTTP ${res.status}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/subjects/fantasy.json?limit=1`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    if (!this.connected) throw new Error('Not connected');
    return ['books', 'authors'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'authors') {
      return { table, columns: [
        { name: 'key', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'birth_date', type: 'string', nullable: true },
        { name: 'top_work', type: 'string', nullable: true },
        { name: 'work_count', type: 'number', nullable: true },
      ], primaryKeys: ['key'] };
    }
    return { table, columns: [
      { name: 'key', type: 'string', nullable: false },
      { name: 'title', type: 'string', nullable: false },
      { name: 'edition_count', type: 'number', nullable: true },
      { name: 'first_publish_year', type: 'number', nullable: true },
    ], primaryKeys: ['key'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.connected) throw new Error('Not connected');
    if (table === 'authors') {
      const res = await fetch(`${this.baseUrl}/search/authors.json?q=tolkien&limit=5`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.docs || []).map((a: any) =>
        createEvent({ op: 'S', table: 'authors', after: { key: a.key, name: a.name, birth_date: a.birth_date, top_work: a.top_work, work_count: a.work_count }, watermark: a.key })
      );
    }
    const res = await fetch(`${this.baseUrl}/subjects/fantasy.json?limit=5`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.works || []).map((w: any) =>
      createEvent({ op: 'S', table: 'books', after: { key: w.key, title: w.title, edition_count: w.edition_count, first_publish_year: w.first_publish_year }, watermark: w.key })
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
