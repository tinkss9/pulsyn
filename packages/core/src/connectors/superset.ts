// @ts-nocheck
// superset Connector — analytics source
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('superset')
export class supersetConnector extends BaseConnector {
  private apiKey: string = '';

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.apiKey = config.password || '';
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { return !!this.apiKey; }
  async getTables(): Promise<string[]> { return ['dashboards', 'queries', 'users']; }
  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, table, columns: [{ name: 'id', type: 'string', nullable: false, defaultValue: null }], primaryKey: ['id'], primaryKeys: ['id'] };
  }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> { return []; }
  async extractIncremental(table: string, opts?: any): Promise<UnifiedChangeEvent[]> { return []; }
  async startCDC(): Promise<void> { throw new Error('CDC not supported'); }
  async stopCDC(): Promise<void> {}
}