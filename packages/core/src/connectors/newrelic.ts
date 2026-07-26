// @ts-nocheck
// New Relic Connector — observability source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('newrelic')
export class NewRelicConnector extends BaseConnector {
  private apiKey: string = '';
  private accountId: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'newrelic', config); this.accountId = (config as any).accountId || ''; }
  async connect(config: DatabaseConfig): Promise<void> { this.apiKey = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch('https://api.newrelic.com/graphql', { method: 'POST', headers: { 'Api-Key': this.apiKey, 'Content-Type': 'application/json' }, body: '{ "query": "{ actor { user { id } } }" }' }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['entities', 'alerts', 'dashboards']; }
  async getTableSchema(table: string): Promise<TableSchema> { return { name: table, columns: [{ name: 'guid', type: 'string', nullable: false }, { name: 'name', type: 'string', nullable: true }, { name: 'type', type: 'string', nullable: true }], primaryKey: ['guid'] }; }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const query = `{ actor { ${table}(searchCriteria: { limit: 100 }) { results { guid name type } } } }`;
    const r = await fetch('https://api.newrelic.com/graphql', { method: 'POST', headers: { 'Api-Key': this.apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
    const d = await r.json() as any;
    return (d.data?.actor?.[table]?.results || []).map((i: any) => createEvent({ op: 'S', table, after: i, watermark: i.guid }));
  }
  async startCDC(): Promise<void> { throw new Error('New Relic CDC requires NRQL streaming'); }
  async stopCDC(): Promise<void> {}
}



