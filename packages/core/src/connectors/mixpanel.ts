// Mixpanel Connector — product analytics source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('mixpanel')
export class MixpanelConnector extends BaseConnector {
  private apiSecret: string = '';
  private projectId: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'mixpanel', config);
    this.projectId = (config as any).projectId || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiSecret = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const auth = Buffer.from(`${this.apiSecret}:`).toString('base64');
      const res = await fetch('https://data.mixpanel.com/api/2.0/engage', {
        headers: { Authorization: `Basic ${auth}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['events', 'people', 'funnels']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'event', type: 'string', nullable: true },
        { name: 'properties', type: 'object', nullable: true },
        { name: 'distinct_id', type: 'string', nullable: true },
      ],
      primaryKey: ['distinct_id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const auth = Buffer.from(`${this.apiSecret}:`).toString('base64');
    const res = await fetch(`https://data.mixpanel.com/api/2.0/export?project_id=${this.projectId}`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
    });
    const text = await res.text();
    const lines = text.split('\n').filter(l => l.trim());
    return lines.slice(0, this.batchSize).map((line, i) => {
      const data = JSON.parse(line);
      return createEvent({ op: 'S', table, after: data, watermark: data.properties?.time || String(i) });
    });
  }

  async startCDC(): Promise<void> { throw new Error('Mixpanel CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}


