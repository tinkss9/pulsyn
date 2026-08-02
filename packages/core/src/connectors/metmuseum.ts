// Met Museum API — Metropolitan Museum of Art (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('metmuseum')
export class MetMuseumConnector extends BaseConnector {
  private baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';
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
      const res = await fetch(`${this.baseUrl}/objects/45734`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['departments', 'objects'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'departments') {
      return { table, columns: [
        { name: 'departmentId', type: 'number', nullable: false },
        { name: 'displayName', type: 'string', nullable: false },
      ], primaryKeys: ['departmentId'] };
    }
    return { table, columns: [
      { name: 'objectID', type: 'number', nullable: false },
      { name: 'title', type: 'string', nullable: false },
      { name: 'artistDisplayName', type: 'string', nullable: true },
      { name: 'objectDate', type: 'string', nullable: true },
      { name: 'classification', type: 'string', nullable: true },
    ], primaryKeys: ['objectID'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'departments') {
      const res = await fetch(`${this.baseUrl}/departments`);
      const data = await res.json();
      return data.departments.map((d: any) =>
        createEvent({ op: 'S', table: 'departments', after: d, watermark: String(d.departmentId) })
      );
    }
    const objIds = [45734, 45910, 436121, 437133, 435809];
    const events: UnifiedChangeEvent[] = [];
    for (const id of objIds) {
      const res = await fetch(`${this.baseUrl}/objects/${id}`);
      if (res.ok) {
        const data = await res.json();
        events.push(createEvent({ op: 'S', table: 'objects', after: data, watermark: String(id) }));
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
