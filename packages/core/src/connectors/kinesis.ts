// Kinesis Connector — stub (not implemented)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('kinesis')
export class KinesisConnector extends BaseConnector {
  async connect(config: DatabaseConfig): Promise<void> {
    throw new Error('Kinesis connector not implemented');
  }
  async disconnect(): Promise<void> {}
  async testConnection(): Promise<boolean> { return false; }
  async getTables(): Promise<string[]> { return []; }
  async getTableSchema(table: string): Promise<TableSchema> { throw new Error('Not implemented'); }
  async startCDC(callback: (event: CDCEvent) => void): Promise<void> { throw new Error('Not implemented'); }
  async stopCDC(): Promise<void> {}
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> { return []; }
  async extractIncremental(table: string, opts?: any): Promise<UnifiedChangeEvent[]> { return []; }
}
