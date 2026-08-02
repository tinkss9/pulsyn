// Potion API — Wizards (Harry Potter) API (no auth)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('wizardworld')
export class WizardWorldConnector extends BaseConnector {
  private baseUrl = 'https://wizard-world-api.herokuapp.com';
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
      const res = await fetch(`${this.baseUrl}/Elixirs`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['elixirs', 'houses', 'wizards'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (table === 'houses') {
      return { table, columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'houseColours', type: 'string', nullable: true },
        { name: 'founder', type: 'string', nullable: true },
      ], primaryKeys: ['id'] };
    }
    if (table === 'wizards') {
      return { table, columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'firstName', type: 'string', nullable: false },
        { name: 'lastName', type: 'string', nullable: false },
      ], primaryKeys: ['id'] };
    }
    return { table, columns: [
      { name: 'id', type: 'string', nullable: false },
      { name: 'name', type: 'string', nullable: false },
      { name: 'difficulty', type: 'string', nullable: true },
      { name: 'ingredients', type: 'array', nullable: true },
    ], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const endpoint = table === 'houses' ? 'Houses' : table === 'wizards' ? 'Wizards' : 'Elixirs';
    const res = await fetch(`${this.baseUrl}/${endpoint}`);
    const data = await res.json();
    return data.slice(0, 10).map((item: any) =>
      createEvent({ op: 'S', table: table, after: item, watermark: item.id })
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
