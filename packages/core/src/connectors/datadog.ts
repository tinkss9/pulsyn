// Datadog Connector — monitoring/observability source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('datadog')
export class DatadogConnector extends BaseConnector {
  private apiKey: string = '';
  private appKey: string = '';
  private site: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'datadog', config);
    this.site = (config as any).site || 'datadoghq.com';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiKey = config.user;
    this.appKey = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`https://api.${this.site}/api/v1/validate`, {
        headers: { 'DD-API-KEY': this.apiKey, 'DD-APPLICATION-KEY': this.appKey },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['metrics', 'monitors', 'dashboards', 'logs']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: true },
        { name: 'created', type: 'datetime', nullable: true },
        { name: 'modified', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`https://api.${this.site}/api/v1/${table}?page_size=100`, {
      headers: { 'DD-API-KEY': this.apiKey, 'DD-APPLICATION-KEY': this.appKey },
    });
    const data = await res.json() as any;
    return (data || []).map((item: any) =>
      createEvent({ op: 'S', table, after: item, watermark: item.id })
    );
  }

  async startCDC(): Promise<void> { throw new Error('Datadog CDC requires event streaming — use polling'); }
  async stopCDC(): Promise<void> {}
}


