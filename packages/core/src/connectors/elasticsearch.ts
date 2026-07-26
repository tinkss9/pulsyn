// Elasticsearch Connector — search/analytics source/target
// npm install @elastic/elasticsearch

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let Client: any;
try { Client = require('@elastic/elasticsearch').Client; } catch {}

@registerSource('elasticsearch')
export class ElasticsearchConnector extends BaseConnector {
  private client: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'elasticsearch', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!Client) throw new Error('@elastic/elasticsearch not installed');
    this.client = new Client({ node: `http://${config.host}:${config.port || 9200}`, auth: { username: config.user, password: config.password } });
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.ping(); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    const result = await this.client.cat.indices({ format: 'json' });
    return result.map((i: any) => i.index).filter((i: string) => !i.startsWith('.'));
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const mapping = await this.client.indices.getMapping({ index: table });
    const props = mapping[table]?.mappings?.properties || {};
    return {
      name: table,
      columns: Object.entries(props).map(([name, meta]: [string, any]) => ({ name, type: meta.type || 'object', nullable: true })),
      primaryKey: ['_id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const result = await this.client.search({ index: table, size: this.batchSize });
    return (result.hits?.hits || []).map((hit: any) =>
      createEvent({ op: 'S', table, after: hit._source, watermark: hit._id })
    );
  }

  async startCDC(): Promise<void> {
    // Elasticsearch has no native CDC — use polling or Elastic Agent
    throw new Error('Elasticsearch CDC not yet implemented — use polling-based extraction');
  }

  async stopCDC(): Promise<void> {}

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    const body = events.flatMap(e => [{ index: { _index: table } }, e.after || {}]);
    const result = await this.client.bulk({ body });
    return result.items?.length || 0;
  }
}


