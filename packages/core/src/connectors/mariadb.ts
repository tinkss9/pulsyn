import { registerSource } from '../registry';
import { BaseConnector } from '../base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../../types';

@registerSource('mariadb')
export class MariadbConnector extends BaseConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mariadb', 'mariadb', config);
  }

  async connect(config?: DatabaseConfig): Promise<void> {
    const cfg = config || this.config;
    // Connection: mariadb via native
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
