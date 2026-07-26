// @ts-nocheck
import { CosmosClient, Database, Container, FeedResponse } from '@azure/cosmos';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('cosmosdb')
export class CosmosDBConnector extends BaseConnector {
  private client: CosmosClient | null = null;
  private database: Database | null = null;
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const endpoint = config.host.startsWith('https://') ? config.host : `https://${config.host}`;
      this.client = new CosmosClient({
        endpoint,
        key: config.password,
        connectionPolicy: {
          requestTimeout: 30000,
          retryOptions: { maxRetryAttemptCount: 3, maxWaitTimeInSeconds: 30 },
        },
      });
      this.database = this.client.database(config.database);
      await this.database.read();
      this.connected = true;
    } catch (error) {
      throw new Error(`CosmosDB connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.client = null;
    this.database = null;
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.database) return false;
      await this.database.read();
      return true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.database) throw new Error('Not connected');
    const { resources } = await this.database.containers.readAll().fetchAll();
    return resources.map((c) => c.id).sort();
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.database) throw new Error('Not connected');
    const container = this.database.container(table);
    // Sample documents to infer schema
    const { resources } = await container.items.query('SELECT TOP 100 * FROM c').fetchAll();
    const fieldTypes = new Map<string, Set<string>>();

    for (const doc of resources) {
      for (const [key, value] of Object.entries(doc)) {
        if (key.startsWith('_')) continue; // Skip system properties
        if (!fieldTypes.has(key)) fieldTypes.set(key, new Set());
        fieldTypes.get(key)!.add(typeof value);
      }
    }

    const columns = Array.from(fieldTypes.entries()).map(([name, types]) => ({
      name, type: Array.from(types).join('|'),
      nullable: resources.some((d) => d[name] === null || d[name] === undefined),
      defaultValue: null,
    }));

    // Get partition key from container settings
    const { resource } = await container.read();
    const partitionKeyPaths = resource?.partitionKey?.paths || ['/id'];
    const pkName = partitionKeyPaths[0]?.replace('/', '') || 'id';

    return { table, columns, primaryKeys: ['id', pkName].filter((v, i, a) => a.indexOf(v) === i) };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.database) throw new Error('Not connected');
    this.cdcActive = true;
    this.pollChangeFeed(callback);
  }

  private async pollChangeFeed(cb: (event: CDCEvent) => void): Promise<void> {
    if (!this.database) return;
    const containers = await this.getTables();
    const continuationTokens = new Map<string, string>();

    while (this.cdcActive && this.database) {
      try {
        for (const containerName of containers) {
          const container = this.database!.container(containerName);
          const options: any = { startFromBeginning: false };
          const token = continuationTokens.get(containerName);
          if (token) options.continuationToken = token;

          const iterator = container.items.changeFeed(options);
          const response = await iterator.fetchNext();

          if (response.resources && response.resources.length > 0) {
            for (const doc of response.resources) {
              const { _rid, _self, _etag, _attachments, _ts, _lsn, ...data } = doc;
              cb({ op: 'U', table: containerName, before: null, after: data, ts: new Date(_ts * 1000) });
            }
          }
          if (response.continuationToken) {
            continuationTokens.set(containerName, response.continuationToken);
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
    if (!this.database) throw new Error('Not connected');
    const container = this.database.container(table);
    const events: UnifiedChangeEvent[] = [];
    let continuationToken: string | undefined;

    do {
      const response = await container.items
        .query('SELECT * FROM c', { maxItemCount: this.batchSize, continuationToken })
        .fetchNext();

      for (const doc of response.resources || []) {
        const { _rid, _self, _etag, _attachments, _ts, ...data } = doc;
        events.push(createEvent('S', table, data, null, doc.id || null, { source: 'cosmosdb' }));
      }
      continuationToken = response.continuationToken;
    } while (continuationToken);

    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.database) throw new Error('Not connected');
    const container = this.database.container(table);
    const wmCol = this.config.watermarkColumn || '_ts';
    const events: UnifiedChangeEvent[] = [];

    const query = watermark
      ? `SELECT * FROM c WHERE c.${wmCol} > ${watermark} ORDER BY c.${wmCol}`
      : `SELECT * FROM c ORDER BY c.${wmCol}`;

    const { resources } = await container.items
      .query(query, { maxItemCount: this.batchSize })
      .fetchAll();

    for (const doc of resources) {
      const { _rid, _self, _etag, _attachments, _ts, ...data } = doc;
      events.push(createEvent('I', table, data, null, doc[wmCol]?.toString() || null, { source: 'cosmosdb' }));
    }
    return events;
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.database) throw new Error('Not connected');
    const container = this.database.container(table);
    const { resources } = await container.items.query('SELECT VALUE COUNT(1) FROM c').fetchAll();
    return resources[0] || 0;
  }

  async getPrimaryKey(): Promise<string> {
    return 'id';
  }
}

