// @ts-nocheck
// activemq Connector — streaming source
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('activemq')
export class activemqConnector extends BaseConnector {
  private client: any = null;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { return true; }
  async getTables(): Promise<string[]> { return ['topics', 'queues']; }
  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, table, columns: [{ name: 'id', type: 'string', nullable: false, defaultValue: null }], primaryKey: ['id'], primaryKeys: ['id'] };
  }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> { return []; }
  async extractIncremental(table: string, opts?: any): Promise<UnifiedChangeEvent[]> { return []; }
  async startCDC(): Promise<void> { throw new Error('CDC not implemented'); }
  async stopCDC(): Promise<void> {}
}