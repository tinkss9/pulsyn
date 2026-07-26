// @ts-nocheck
// PostHog Connector — product analytics source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('posthog')
export class PostHogConnector extends BaseConnector {
  private apiKey: string = '';
  private projectId: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'posthog', config);
    this.projectId = (config as any).projectId || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiKey = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`https://app.posthog.com/api/projects/${this.projectId}/`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['events', 'persons', 'insights']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'event', type: 'string', nullable: true },
        { name: 'timestamp', type: 'datetime', nullable: true },
        { name: 'properties', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`https://app.posthog.com/api/projects/${this.projectId}/${table}/?limit=100`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    const data = await res.json() as any;
    return (data.results || []).map((item: any) =>
      createEvent({ op: 'S', table, after: item, watermark: item.id || item.timestamp })
    );
  }

  async startCDC(): Promise<void> { throw new Error('PostHog CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}



