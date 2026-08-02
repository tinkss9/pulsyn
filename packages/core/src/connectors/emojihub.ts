// EmojiHub API — Emoji data (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('emojihub')
export class EmojiHubConnector extends BaseConnector {
  private baseUrl = 'https://emojihub.yurace.pro/api';
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
      const res = await fetch(`${this.baseUrl}/all/category/smileys-and-people`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['emojis', 'categories', 'groups'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'categories' || table === 'groups') {
      return { table, columns: [
        { name: 'name', type: 'string', nullable: false },
      ], primaryKeys: ['name'] };
    }
    return { table, columns: [
      { name: 'name', type: 'string', nullable: false },
      { name: 'category', type: 'string', nullable: false },
      { name: 'group', type: 'string', nullable: false },
      { name: 'htmlCode', type: 'array', nullable: false },
      { name: 'unicode', type: 'array', nullable: false },
    ], primaryKeys: ['name'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'categories') {
      const cats = ['smileys-and-people', 'animals-and-nature', 'food-and-drink', 'travel-and-places', 'activities', 'objects', 'symbols', 'flags'];
      return cats.map(c => createEvent('emojihub', 'categories', 'c', { name: c }, c));
    }
    if (table === 'groups') {
      const groups = ['happy', 'sad', 'angry', 'surprised', 'neutral'];
      return groups.map(g => createEvent('emojihub', 'groups', 'c', { name: g }, g));
    }
    const res = await fetch(`${this.baseUrl}/all/category/smileys-and-people`);
    const data = await res.json();
    return data.slice(0, 10).map((e: any) =>
      createEvent('emojihub', 'emojis', 'c', e, e.name)
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
