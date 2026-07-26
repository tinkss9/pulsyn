// Figma Connector — design tool source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('figma')
export class FigmaConnector extends BaseConnector {
  private token: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'figma', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.token = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.figma.com/v1/me', {
        headers: { 'X-Figma-Token': this.token },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['files', 'projects', 'teams']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: true },
        { name: 'lastModified', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`https://api.figma.com/v1/${table}`, {
      headers: { 'X-Figma-Token': this.token },
    });
    const data = await res.json() as any;
    return (data.projects || data.files || []).map((item: any) =>
      createEvent({ op: 'S', table, after: item, watermark: item.id })
    );
  }

  async startCDC(): Promise<void> { throw new Error('Figma CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}
