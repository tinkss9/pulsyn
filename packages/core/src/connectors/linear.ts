// Linear Connector — project management SaaS source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('linear')
export class LinearConnector extends BaseConnector {
  private apiKey: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'linear', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiKey = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: { Authorization: this.apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ viewer { id } }' }),
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['issues', 'projects', 'teams', 'users']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'title', type: 'string', nullable: true },
        { name: 'state', type: 'string', nullable: true },
        { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const query = `{ ${table}(first: 100) { nodes { id title state createdAt updatedAt } } }`;
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { Authorization: this.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json() as any;
    return (data.data?.[table]?.nodes || []).map((item: any) =>
      createEvent({ op: 'S', table, after: item, watermark: item.id })
    );
  }

  async startCDC(): Promise<void> { throw new Error('Linear CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}


