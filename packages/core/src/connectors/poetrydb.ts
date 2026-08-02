// Poetry DB API — Poems and poetry (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('poetrydb')
export class PoetryDBConnector extends BaseConnector {
  private baseUrl = 'https://poetrydb.org';
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
      const res = await fetch(`${this.baseUrl}/author/Shakespeare/title`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['poems', 'authors'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'authors') {
      return { table, columns: [
        { name: 'name', type: 'string', nullable: false },
      ], primaryKeys: ['name'] };
    }
    return { table, columns: [
      { name: 'title', type: 'string', nullable: false },
      { name: 'author', type: 'string', nullable: false },
      { name: 'lines', type: 'array', nullable: false },
      { name: 'linecount', type: 'number', nullable: false },
    ], primaryKeys: ['title'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'authors') {
      const res = await fetch(`${this.baseUrl}/author`);
      const data = await res.json();
      return data.authors.slice(0, 10).map((name: string) =>
        createEvent('poetrydb', 'authors', 'c', { name }, name)
      );
    }
    const res = await fetch(`${this.baseUrl}/author/Shakespeare/title,author,linecount`);
    const data = await res.json();
    return data.slice(0, 5).map((p: any) =>
      createEvent('poetrydb', 'poems', 'c', p, p.title)
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
