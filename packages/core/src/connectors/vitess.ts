import { registerSource } from '../registry';
import { BaseConnector } from '../base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../../types';

@registerSource('vitess')
export class VitessConnector extends BaseConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'vitess', 'vitess', config);
  }

  async connect(config?: DatabaseConfig): Promise<void> {
    const cfg = config || this.config;
    // Connection: vitess via grpc
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
