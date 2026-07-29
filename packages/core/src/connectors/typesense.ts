import { registerSource } from '../registry';
import { BaseConnector } from '../base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../../types';

@registerSource('typesense')
export class TypesenseConnector extends BaseConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'typesense', 'typesense', config);
  }

  async connect(config?: DatabaseConfig): Promise<void> {
    const cfg = config || this.config;
    // Connection: typesense via rest
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    return this.connected;
  }

  async getTables(): Promise<string[]> {
    return [];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { columns: [], primaryKey: [] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {}
  async stopCDC(): Promise<void> {}
}
