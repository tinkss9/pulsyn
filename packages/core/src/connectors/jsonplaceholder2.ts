// JSONPlaceholder-like API � Typicode fake data (no auth, different endpoint)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('jsonplaceholder2')
export class JSONPlaceholder2Connector extends BaseConnector {
  private baseUrl = 'https://jsonplaceholder.typicode.com';
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
      const res = await fetch(`${this.baseUrl}/comments?_limit=1`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['comments', 'albums', 'photos'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schemas: Record<string, TableSchema> = {
      comments: { table, columns: [
        { name: 'id', type: 'number', nullable: false },
        { name: 'postId', type: 'number', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'email', type: 'string', nullable: false },
        { name: 'body', type: 'string', nullable: false },
      ], primaryKeys: ['id'] },
      albums: { table, columns: [
        { name: 'id', type: 'number', nullable: false },
        { name: 'userId', type: 'number', nullable: false },
        { name: 'title', type: 'string', nullable: false },
      ], primaryKeys: ['id'] },
      photos: { table, columns: [
        { name: 'id', type: 'number', nullable: false },
        { name: 'albumId', type: 'number', nullable: false },
        { name: 'title', type: 'string', nullable: false },
        { name: 'url', type: 'string', nullable: false },
        { name: 'thumbnailUrl', type: 'string', nullable: false },
      ], primaryKeys: ['id'] },
    };
    return schemas[table] || schemas.comments;
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`${this.baseUrl}/${table}?_limit=10`);
    const data = await res.json();
    return data.map((item: any) => createEvent({ op: 'S', table: table, after: item, watermark: String(item.id) }));
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
