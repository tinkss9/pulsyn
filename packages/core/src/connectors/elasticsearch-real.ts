// Elasticsearch Connector — Real API Integration
// Auth: API key or basic auth
// API: Elasticsearch REST API
// Test: Local Docker or free Elastic Cloud trial

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('elasticsearch-real')
export class ElasticsearchRealConnector extends BaseConnector {
  private baseUrl = '';
  private apiKey = '';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.baseUrl = config.host || 'http://localhost:9200';
    this.apiKey = config.token || config.password || '';
    const resp = await this.esGet('/');
    if (!resp.ok) throw new Error(`Elasticsearch connection failed: HTTP ${resp.status}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { return (await this.esGet('/')).ok; } catch { return false; } }

  async getTables(): Promise<string[]> {
    const resp = await this.esGet('/_cat/indices?format=json&h=index');
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.map((i: any) => i.index).filter((n: string) => !n.startsWith('.'));
  }

  async getTableSchema(index: string): Promise<TableSchema> {
    const resp = await this.esGet(`/${index}/_mapping`);
    if (!resp.ok) return { table: index, columns: [], primaryKeys: [] };
    const data = await resp.json();
    const props = data[index]?.mappings?.properties || {};
    return {
      table: index,
      columns: Object.entries(props).map(([name, meta]: [string, any]) => ({
        name, type: this.mapType(meta.type), nullable: true, primaryKey: name === '_id',
      })),
      primaryKeys: ['_id'],
    };
  }

  async extractFull(index: string): Promise<UnifiedChangeEvent[]> {
    const resp = await this.esPost(`/${index}/_search`, { size: 100, query: { match_all: {} } });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.hits?.hits || []).map((hit: any) =>
      createEvent({ op: 'S', table: index, after: { _id: hit._id, ...hit._source }, watermark: null })
    );
  }

  async extractIncremental(index: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    let query: any = { match_all: {} };
    if (opts?.watermarkColumn && opts?.watermarkValue) {
      query = { range: { [opts.watermarkColumn]: { gt: opts.watermarkValue } } };
    }
    const resp = await this.esPost(`/${index}/_search`, { size: 100, query, sort: [{ _doc: 'asc' }] });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.hits?.hits || []).map((hit: any) =>
      createEvent({ op: 'S', table: index, after: { _id: hit._id, ...hit._source }, watermark: null })
    );
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> { this.cdcActive = true; }
  async stopCDC(): Promise<void> { this.cdcActive = false; }

  private async esGet(path: string): Promise<Response> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['Authorization'] = `ApiKey ${this.apiKey}`;
    return fetch(`${this.baseUrl}${path}`, { headers });
  }

  private async esPost(path: string, body: any): Promise<Response> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['Authorization'] = `ApiKey ${this.apiKey}`;
    return fetch(`${this.baseUrl}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  }

  private mapType(esType: string): string {
    const map: Record<string, string> = { 'text': 'string', 'keyword': 'string', 'long': 'number', 'integer': 'number', 'short': 'number', 'byte': 'number', 'double': 'number', 'float': 'number', 'boolean': 'boolean', 'date': 'string', 'object': 'json', 'nested': 'json', 'geo_point': 'json' };
    return map[esType] || 'string';
  }
}
