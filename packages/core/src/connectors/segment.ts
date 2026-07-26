// @ts-nocheck
// Segment Connector — customer data platform source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('segment')
export class SegmentConnector extends BaseConnector {
  private apiKey: string = '';
  private spaceId: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'segment', config);
    this.spaceId = (config as any).spaceId || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiKey = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://platform.segmentapis.com/v1beta/workspaces', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['sources', 'destinations', 'tracking_plans']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'name', type: 'string', nullable: false },
        { name: 'slug', type: 'string', nullable: true },
        { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['name'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`https://platform.segmentapis.com/v1beta/workspaces/${this.spaceId}/${table}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    const data = await res.json() as any;
    return (data[table] || []).map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.name }));
  }

  async startCDC(): Promise<void> { throw new Error('Segment CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}



