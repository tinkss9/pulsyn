// @ts-nocheck
import { Client as ElasticClient, estypes } from '@elastic/elasticsearch';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('elasticsearch')
export class ElasticsearchConnector extends BaseConnector {
  private client: ElasticClient | null = null;
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const protocol = config.ssl ? 'https' : 'http';
      const node = config.host.startsWith('http') ? config.host : `${protocol}://${config.host}:${config.port || 9200}`;
      this.client = new ElasticClient({
        node,
        auth: config.username ? { username: config.username, password: config.password } : undefined,
        tls: config.ssl ? { rejectUnauthorized: false } : undefined,
        maxRetries: 3,
        requestTimeout: 30000,
      });
      await this.client.ping();
      this.connected = true;
    } catch (error) {
      throw new Error(`Elasticsearch connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
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
    const result = await this.client.cat.indices({ format: 'json' });
    return (result as any[])
      .map((idx: any) => idx.index as string)
      .filter((name) => !name.startsWith('.'))
      .sort();
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.client) throw new Error('Not connected');
    const mapping = await this.client.indices.getMapping({ index: table });
    const properties = (mapping as any)[table]?.mappings?.properties || {};
    const columns = Object.entries(properties).map(([name, def]: [string, any]) => ({
      name,
      type: def.type || 'object',
      nullable: true,
      defaultValue: null,
    }));
    return { table, columns, primaryKeys: ['_id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    this.cdcActive = true;
    this.pollSeqNo(callback);
  }

  private async pollSeqNo(cb: (event: CDCEvent) => void): Promise<void> {
    const seqNos = new Map<string, number>();

    while (this.cdcActive && this.client) {
      try {
        const indices = await this.getTables();
        for (const index of indices) {
          const lastSeqNo = seqNos.get(index) || 0;
          const result = await this.client!.search({
            index,
            body: {
              query: { range: { _seq_no: { gt: lastSeqNo } } },
              sort: [{ _seq_no: 'asc' }],
              size: this.batchSize,
              seq_no_primary_term: true,
            },
          });

          const hits = (result as any).hits?.hits || [];
          for (const hit of hits) {
            cb({
              op: 'U', table: index,
              before: null, after: hit._source,
              ts: new Date(),
            });
            const hitSeqNo = hit._seq_no || 0;
            if (hitSeqNo > (seqNos.get(index) || 0)) {
              seqNos.set(index, hitSeqNo);
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

    // Use scroll API for large datasets
    const scrollResponse = await this.client.search({
      index: table,
      scroll: '2m',
      body: { query: { match_all: {} }, size: this.batchSize },
    });

    let scrollId = (scrollResponse as any)._scroll_id;
    let hits = (scrollResponse as any).hits?.hits || [];

    while (hits.length > 0) {
      for (const hit of hits) {
        events.push(createEvent('S', table, hit._source, null, hit._id || null, { source: 'elasticsearch', _seq_no: hit._seq_no }));
      }

      if (!scrollId) break;
      const scrollResult = await this.client.scroll({ scroll_id: scrollId, scroll: '2m' });
      scrollId = (scrollResult as any)._scroll_id;
      hits = (scrollResult as any).hits?.hits || [];
    }

    // Clear scroll
    if (scrollId) {
      await this.client.clearScroll({ scroll_id: scrollId }).catch(() => {});
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.client) throw new Error('Not connected');
    const wmCol = this.config.watermarkColumn || '@timestamp';
    const events: UnifiedChangeEvent[] = [];

    const query = watermark
      ? { range: { [wmCol]: { gt: watermark } } }
      : { match_all: {} };

    const result = await this.client.search({
      index: table,
      body: {
        query,
        sort: [{ [wmCol]: 'asc' }],
        size: this.batchSize,
      },
    });

    const hits = (result as any).hits?.hits || [];
    for (const hit of hits) {
      const wm = hit._source?.[wmCol]?.toString() || hit._seq_no?.toString() || null;
      events.push(createEvent('I', table, hit._source, null, wm, { source: 'elasticsearch' }));
    }
    return events;
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.client) throw new Error('Not connected');
    const result = await this.client.count({ index: table });
    return (result as any).count || 0;
  }

  async getPrimaryKey(): Promise<string> {
    return '_id';
  }
}

