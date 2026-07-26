// Webflow Connector — website builder source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('webflow')
export class WebflowConnector extends BaseConnector {
  private token: string = '';
  private siteId: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'webflow', config);
    this.siteId = (config as any).siteId || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.token = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`https://api.webflow.com/v2/sites/${this.siteId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['pages', 'collections', 'items']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: true },
        { name: 'lastUpdated', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const endpoint = table === 'collections' ? `sites/${this.siteId}/collections` : table;
    const res = await fetch(`https://api.webflow.com/v2/${endpoint}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const data = await res.json() as any;
    return (data || []).map((item: any) =>
      createEvent({ op: 'S', table, after: item, watermark: item.id })
    );
  }

  async startCDC(): Promise<void> { throw new Error('Webflow CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}
