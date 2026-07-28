// @ts-nocheck
// cockroachdb Connector — database source
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('cockroachdb')
export class cockroachdbConnector extends BaseConnector {
  private pool: any = null;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  async getTables(): Promise<string[]> {
    return [];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, table, columns: [], primaryKeys: [], primaryKey: [] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    return [];
  }

  async extractIncremental(table: string, opts?: any): Promise<UnifiedChangeEvent[]> {
    return [];
  }
}