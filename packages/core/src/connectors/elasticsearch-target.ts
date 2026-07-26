// @ts-nocheck
import { Client as ElasticClient } from '@elastic/elasticsearch';
import { BaseConnector } from './base';
import { registerTarget } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerTarget('elasticsearch')
export class ElasticsearchTargetConnector extends BaseConnector {
  private client: ElasticClient | null = null;
  private indexPrefix: string = '';
  private refreshPolicy: 'true' | 'false' | 'wait_for' = 'false';

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 'elasticsearch', config, options?.batchSize || 5000);
    if (options?.indexPrefix) this.indexPrefix = options.indexPrefix;
    if (options?.refreshPolicy) this.refreshPolicy = options.refreshPolicy;
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const node = config.host?.startsWith('http') ? config.host : `http://${config.host || 'localhost'}:${config.port || 9200}`;

    this.client = new ElasticClient({
      node,
      auth: config.username ? {
        username: config.username,
        password: config.password || '',
      } : undefined,
      tls: config.ssl ? { rejectUnauthorized: false } : undefined,
      maxRetries: 3,
      requestTimeout: 30000,
      sniffOnStart: false,
    });

    const info = await this.client.info();
    if (!info.version) throw new Error('Failed to connect to Elasticsearch');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) return false;
      const result = await this.client.ping();
      return result === true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.client) throw new Error('Not connected');
    const indices = await this.client.cat.indices({ format: 'json' });
    return (indices as any[]).map((idx: any) => idx.index).filter((n: string) => !n.startsWith('.'));
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.client) throw new Error('Not connected');
    const indexName = this.getIndexName(table);
    const mapping = await this.client.indices.getMapping({ index: indexName });
    const properties = (mapping as any)[indexName]?.mappings?.properties || {};
    return {
      table,
      columns: Object.entries(properties).map(([name, meta]: [string, any]) => ({
        name, type: meta.type || 'object', nullable: true, defaultValue: null,
      })),
      primaryKeys: ['_id'],
    };
  }

  async startCDC(_cb: (event: CDCEvent) => void): Promise<void> {
    throw new Error('Elasticsearch target does not support CDC read');
  }
  async stopCDC(): Promise<void> {}

  async createTableIfNeeded(table: string, schema: Record<string, any>): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    const indexName = this.getIndexName(table);
    const exists = await this.client.indices.exists({ index: indexName });
    if (exists) return;

    const properties: Record<string, any> = {};
    for (const [name, type] of Object.entries(schema)) {
      properties[name] = { type: this.mapType(type) };
    }

    await this.client.indices.create({
      index: indexName,
      body: {
        settings: { number_of_shards: 3, number_of_replicas: 1 },
        mappings: { properties },
      },
    });
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    if (!this.client) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    const indexName = this.getIndexName(table);
    let written = 0;

    for (let i = 0; i < rows.length; i += this.batchSize) {
      const batch = rows.slice(i, i + this.batchSize);
      const bulkBody: any[] = [];

      for (const row of batch) {
        const docId = this.extractDocId(row, events[i]?.sourceMetadata);
        bulkBody.push({ index: { _index: indexName, ...(docId ? { _id: docId } : {}) } });
        bulkBody.push(this.serializeDoc(row));
      }

      const result = await this.client.bulk({
        body: bulkBody,
        refresh: this.refreshPolicy,
      });

      if (result.errors) {
        const errors = result.items.filter((item: any) => item.index?.error);
        const successCount = batch.length - errors.length;
        if (errors.length > 0) {
          console.error(`Elasticsearch bulk errors: ${errors.length}/${batch.length} failed. First: ${JSON.stringify(errors[0])}`);
        }
        written += successCount;
      } else {
        written += batch.length;
      }
    }
    return written;
  }

  async merge(table: string, events: UnifiedChangeEvent[], keyColumns: string[]): Promise<number> {
    if (!this.client) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => ({ after: e.after!, meta: e.sourceMetadata }));
    if (rows.length === 0) return 0;

    const indexName = this.getIndexName(table);
    let merged = 0;

    for (let i = 0; i < rows.length; i += this.batchSize) {
      const batch = rows.slice(i, i + this.batchSize);
      const bulkBody: any[] = [];

      for (const { after, meta } of batch) {
        const docId = keyColumns.map((k) => after[k]).join('_') || this.extractDocId(after, meta);
        if (!docId) {
          // Fallback to index action if no key
          bulkBody.push({ index: { _index: indexName } });
          bulkBody.push(this.serializeDoc(after));
        } else {
          bulkBody.push({ update: { _index: indexName, _id: docId } });
          bulkBody.push({ doc: this.serializeDoc(after), doc_as_upsert: true });
        }
      }

      const result = await this.client.bulk({
        body: bulkBody,
        refresh: this.refreshPolicy,
      });

      if (result.errors) {
        const errors = result.items.filter((item: any) => (item.update || item.index)?.error);
        merged += batch.length - errors.length;
      } else {
        merged += batch.length;
      }
    }
    return merged;
  }

  private getIndexName(table: string): string {
    const clean = table.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return this.indexPrefix ? `${this.indexPrefix}_${clean}` : clean;
  }

  private extractDocId(row: Record<string, any>, meta?: Record<string, any>): string | null {
    if (meta?.pk) return String(meta.pk);
    for (const key of ['id', 'ID', '_id', 'pk', 'key']) {
      if (row[key] !== undefined) return String(row[key]);
    }
    return null;
  }

  private serializeDoc(row: Record<string, any>): Record<string, any> {
    const doc: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      if (k === '_id') continue; // ES manages _id separately
      if (v instanceof Date) doc[k] = v.toISOString();
      else doc[k] = v;
    }
    return doc;
  }

  private mapType(type: any): string {
    const t = typeof type === 'string' ? type.toLowerCase() : String(type).toLowerCase();
    if (t.includes('int') || t.includes('long')) return 'long';
    if (t.includes('float') || t.includes('double')) return 'double';
    if (t.includes('bool')) return 'boolean';
    if (t.includes('date') || t.includes('time')) return 'date';
    if (t.includes('json') || t.includes('object')) return 'object';
    if (t.includes('keyword') || t.includes('id')) return 'keyword';
    return 'text';
  }
}

