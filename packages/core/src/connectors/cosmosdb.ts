// CosmosDB Connector — Azure NoSQL database source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let CosmosClient: any;
try { CosmosClient = require('@azure/cosmos').CosmosClient; } catch {}

@registerSource('cosmosdb')
export class CosmosDBConnector extends BaseConnector {
  private client: any = null;
  private database: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'cosmosdb', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!CosmosClient) throw new Error('@azure/cosmos not installed');
    this.client = new CosmosClient({ endpoint: `https://${config.host}`, key: config.password });
    this.database = this.client.database(config.database);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.database = null; this.connected = false; }
  async testConnection(): Promise<boolean> {
    try { await this.database.read(); return true; } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const { resources } = await this.database.containers.readAll().fetchAll();
    return resources.map((c: any) => c.id);
  }

  async getTableSchema(container: string): Promise<TableSchema> {
    return {
      name: container,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: '_ts', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(container: string): Promise<UnifiedChangeEvent[]> {
    const cont = this.database.container(container);
    const { resources } = await cont.items.readAll().fetchAll();
    return resources.slice(0, this.batchSize).map((item: any) =>
      createEvent({ op: 'S', table: container, after: item, watermark: item.id })
    );
  }

  async startCDC(): Promise<void> { throw new Error('CosmosDB CDC requires Change Feed — use polling'); }
  async stopCDC(): Promise<void> {}
}
