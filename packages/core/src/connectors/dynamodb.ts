// @ts-nocheck
import {
  DynamoDBClient, ScanCommand, DescribeTableCommand, ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBStreamsClient, GetShardIteratorCommand, GetRecordsCommand,
  DescribeStreamCommand, ListStreamsCommand,
} from '@aws-sdk/client-dynamodb-streams';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('dynamodb')
export class DynamoDBConnector extends BaseConnector {
  private client: DynamoDBClient | null = null;
  private streamsClient: DynamoDBStreamsClient | null = null;
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const clientConfig = {
        region: (config as any).region || 'ap-southeast-2',
        endpoint: (config as any).endpoint || undefined,
        credentials: config.username ? {
          accessKeyId: config.username,
          secretAccessKey: config.password,
        } : undefined,
      };
      this.client = new DynamoDBClient(clientConfig);
      this.streamsClient = new DynamoDBStreamsClient(clientConfig);
      await this.client.send(new ListTablesCommand({ Limit: 1 }));
      this.connected = true;
    } catch (error) {
      throw new Error(`DynamoDB connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    if (this.client) { this.client.destroy(); this.client = null; }
    if (this.streamsClient) { this.streamsClient.destroy(); this.streamsClient = null; }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.send(new ListTablesCommand({ Limit: 1 }));
      return true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.client) throw new Error('Not connected');
    const tables: string[] = [];
    let lastEvaluated: string | undefined;
    do {
      const result = await this.client.send(new ListTablesCommand({
        ExclusiveStartTableName: lastEvaluated,
        Limit: 100,
      }));
      tables.push(...(result.TableNames || []));
      lastEvaluated = result.LastEvaluatedTableName;
    } while (lastEvaluated);
    return tables.sort();
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.client) throw new Error('Not connected');
    const desc = await this.client.send(new DescribeTableCommand({ TableName: table }));
    const attrs = desc.Table?.AttributeDefinitions || [];
    const keys = desc.Table?.KeySchema || [];
    return {
      table,
      columns: attrs.map((a) => ({
        name: a.AttributeName!, type: a.AttributeType!,
        nullable: false, defaultValue: null,
      })),
      primaryKeys: keys.filter((k) => k.KeyType === 'HASH').map((k) => k.AttributeName!),
    };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.client || !this.streamsClient) throw new Error('Not connected');
    this.cdcActive = true;
    this.pollStreams(callback);
  }

  private async pollStreams(cb: (event: CDCEvent) => void): Promise<void> {
    while (this.cdcActive && this.streamsClient) {
      try {
        const tables = await this.getTables();
        for (const table of tables) {
          const desc = await this.client!.send(new DescribeTableCommand({ TableName: table }));
          const streamArn = desc.Table?.LatestStreamArn;
          if (!streamArn) continue;

          const streamDesc = await this.streamsClient!.send(
            new DescribeStreamCommand({ StreamArn: streamArn } as any) as any
          );
          const shards = (streamDesc as any).StreamDescription?.Shards || [];

          for (const shard of shards) {
            const iterRes = await this.streamsClient!.send(
              new GetShardIteratorCommand({
                StreamArn: streamArn,
                ShardId: shard.ShardId,
                ShardIteratorType: 'LATEST',
              } as any) as any
            );
            let iterator = (iterRes as any).ShardIterator;
            if (!iterator) continue;

            const records = await this.streamsClient!.send(
              new GetRecordsCommand({ ShardIterator: iterator } as any) as any
            );
            for (const rec of (records as any).Records || []) {
              const op = rec.eventName === 'INSERT' ? 'I' : rec.eventName === 'MODIFY' ? 'U' : 'D';
              const after = rec.dynamodb?.NewImage ? unmarshall(rec.dynamodb.NewImage) : null;
              const before = rec.dynamodb?.OldImage ? unmarshall(rec.dynamodb.OldImage) : null;
              cb({ op, table, before, after, ts: new Date() });
            }
          }
        }
        await new Promise((r) => setTimeout(r, 5000));
      } catch {
        if (this.cdcActive) await new Promise((r) => setTimeout(r, 10000));
      }
    }
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.client) throw new Error('Not connected');
    const events: UnifiedChangeEvent[] = [];
    let lastKey: Record<string, any> | undefined;

    do {
      const result = await this.client.send(new ScanCommand({
        TableName: table,
        Limit: this.batchSize,
        ExclusiveStartKey: lastKey,
      }));
      for (const item of result.Items || []) {
        const row = unmarshall(item);
        events.push(createEvent({ op: 'S', table, after: row, before: null, sourceMetadata: { source: 'dynamodb' } }));
      }
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.client) throw new Error('Not connected');
    const wmCol = this.config.watermarkColumn || 'updatedAt';
    const events: UnifiedChangeEvent[] = [];

    const params: any = {
      TableName: table,
      Limit: this.batchSize,
    };
    if (watermark) {
      params.FilterExpression = `#wm > :wm`;
      params.ExpressionAttributeNames = { '#wm': wmCol };
      params.ExpressionAttributeValues = { ':wm': { S: watermark } };
    }

    const result = await this.client.send(new ScanCommand(params));
    for (const item of result.Items || []) {
      const row = unmarshall(item);
      events.push(createEvent({ op: 'I', table, after: row, before: null, sourceMetadata: { source: 'dynamodb', pk: row[wmCol]?.toString() || null } }));
    }
    return events;
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.client) throw new Error('Not connected');
    const desc = await this.client.send(new DescribeTableCommand({ TableName: table }));
    return Number(desc.Table?.ItemCount || 0);
  }

  async getPrimaryKey(table: string): Promise<string> {
    const schema = await this.getTableSchema(table);
    return schema.primaryKeys[0] || 'pk';
  }
}
