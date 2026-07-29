import { registerSource } from './registry';
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent } from '../events';

@registerSource('privy')
export class PrivyConnector extends BaseConnector {
  private baseUrl: string;

  constructor(id: string, config: DatabaseConfig) {
    super(id, 'privy', 'privy', config);
    this.baseUrl = config.host || '';
  }

  async connect(config?: DatabaseConfig): Promise<void> {
    this.baseUrl = (config || this.config).host || this.baseUrl;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { return this.connected; }
  async getTables(): Promise<string[]> { return []; }
  async getTableSchema(table: string): Promise<TableSchema> { return { columns: [], primaryKey: [] }; }

  async extractFull(table: string, opts?: { limit?: number; offset?: number }): Promise<UnifiedChangeEvent[]> {
    return [];
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    return [];
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {}
  async stopCDC(): Promise<void> {}
}
