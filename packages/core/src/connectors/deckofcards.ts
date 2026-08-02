// Deck of Cards API — Shuffle and draw cards (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('deckofcards')
export class DeckOfCardsConnector extends BaseConnector {
  private baseUrl = 'https://www.deckofcardsapi.com/api';
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
      const res = await fetch(`${this.baseUrl}/deck/new/shuffle/?deck_count=1`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['deck', 'cards'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'cards') {
      return { table, columns: [
        { name: 'code', type: 'string', nullable: false },
        { name: 'image', type: 'string', nullable: false },
        { name: 'value', type: 'string', nullable: false },
        { name: 'suit', type: 'string', nullable: false },
      ], primaryKeys: ['code'] };
    }
    return { table, columns: [
      { name: 'deck_id', type: 'string', nullable: false },
      { name: 'shuffled', type: 'boolean', nullable: false },
      { name: 'remaining', type: 'number', nullable: false },
    ], primaryKeys: ['deck_id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'cards') {
      const deckRes = await fetch(`${this.baseUrl}/deck/new/draw/?count=5`);
      const deckData = await deckRes.json();
      return deckData.cards.map((c: any) => createEvent({ op: 'S', table: 'cards', after: c, watermark: c.code }));
    }
    const res = await fetch(`${this.baseUrl}/deck/new/shuffle/?deck_count=1`);
    const data = await res.json();
    return [createEvent({ op: 'S', table: 'deck', after: data, watermark: data.deck_id })];
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
