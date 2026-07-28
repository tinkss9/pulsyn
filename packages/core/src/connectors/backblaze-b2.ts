// @ts-nocheck
// backblaze-b2 Connector — cloud storage source
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('backblaze-b2')
export class backblazeb2Connector extends BaseConnector {
  private client: any = null;
  private bucket: string = '';

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.bucket = config.database || '';
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { return true; }
  async getTables(): Promise<string[]> { return []; }
  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, table, columns: [{ name: 'key', type: 'string', nullable: false, defaultValue: null }], primaryKey: ['key'], primaryKeys: ['key'] };
  }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> { return []; }
  async extractIncremental(table: string, opts?: any): Promise<UnifiedChangeEvent[]> { return []; }
  async startCDC(): Promise<void> { throw new Error('CDC not supported'); }
  async stopCDC(): Promise<void> {}
}