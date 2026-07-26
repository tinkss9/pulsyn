// DynamoDB Connector — AWS NoSQL source
// npm install @aws-sdk/client-dynamodb

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let DynamoDBClient: any, ScanCommand: any, ListTablesCommand: any;
try {
  const sdk = require('@aws-sdk/client-dynamodb');
  DynamoDBClient = sdk.DynamoDBClient; ScanCommand = sdk.ScanCommand; ListTablesCommand = sdk.ListTablesCommand;
} catch {}

@registerSource('dynamodb')
export class DynamoDBConnector extends BaseConnector {
  private client: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'dynamodb', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!DynamoDBClient) throw new Error('@aws-sdk/client-dynamodb not installed');
    this.client = new DynamoDBClient({ region: (config as any).region || 'us-east-1', credentials: { accessKeyId: config.user, secretAccessKey: config.password } });
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.send(new ListTablesCommand({ Limit: 1 })); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    const result = await this.client.send(new ListTablesCommand({}));
    return result.TableNames || [];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, columns: [{ name: 'PK', type: 'string', nullable: false }, { name: 'SK', type: 'string', nullable: true }], primaryKey: ['PK'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const result = await this.client.send(new ScanCommand({ TableName: table, Limit: this.batchSize }));
    return (result.Items || []).map((item: any) => {
      const data: Record<string, any> = {};
      for (const [k, v] of Object.entries(item)) { data[k] = Object.values(v as any)[0]; }
      return createEvent({ op: 'S', table, after: data, watermark: data.PK || '' });
    });
  }

  async startCDC(): Promise<void> { throw new Error('DynamoDB CDC requires DynamoDB Streams — not yet implemented'); }
  async stopCDC(): Promise<void> {}
}


