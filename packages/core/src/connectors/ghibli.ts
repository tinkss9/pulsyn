// Studio Ghibli API (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('ghibli')
export class GhibliConnector extends BaseConnector {
  private baseUrl = 'https://ghibliapi.vercel.app';
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
      const res = await fetch(`${this.baseUrl}/films?limit=1`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['films', 'people', 'locations'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'people') {
      return { table, columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'gender', type: 'string', nullable: true },
        { name: 'age', type: 'string', nullable: true },
      ], primaryKeys: ['id'] };
    }
    if (table === 'locations') {
      return { table, columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'climate', type: 'string', nullable: true },
        { name: 'terrain', type: 'string', nullable: true },
      ], primaryKeys: ['id'] };
    }
    return { table, columns: [
      { name: 'id', type: 'string', nullable: false },
      { name: 'title', type: 'string', nullable: false },
      { name: 'director', type: 'string', nullable: false },
      { name: 'release_date', type: 'string', nullable: false },
      { name: 'rt_score', type: 'string', nullable: true },
    ], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`${this.baseUrl}/${table}`);
    const data = await res.json();
    const idField = data[0]?.id ? 'id' : 'name';
    return data.slice(0, 10).map((item: any) =>
      createEvent('ghibli', table, 'c', item, item[idField])
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
