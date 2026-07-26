// @ts-nocheck
// Linear v2 Connector — Pulsyn CDC Platform
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('linear-v2')
export class LinearV2Connector extends BaseConnector {
  private apiKey: string = '';
  private baseUrl: string = '';
  private accessToken: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'linear-v2', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiKey = config.password;
    this.accessToken = (config as any).accessToken || config.password;
    this.baseUrl = config.host ? (config.host.startsWith('http') ? config.host : 'https://' + config.host) : '';
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.apiKey) headers['Authorization'] = 'Bearer ' + this.apiKey;
      if (this.accessToken) headers['X-Access-Token'] = this.accessToken;
      
      const res = await fetch(this.baseUrl + '/api/v1/status', { headers });
      return res.ok || res.status === 401;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['messages', 'channels', 'users', 'files', 'events'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schemas: Record<string, any> = {
      messages: { columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'text', type: 'string', nullable: true }, { name: 'user', type: 'string', nullable: true }, { name: 'timestamp', type: 'datetime', nullable: true }], primaryKey: ['id'] },
      channels: { columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'name', type: 'string', nullable: true }, { name: 'type', type: 'string', nullable: true }], primaryKey: ['id'] },
      users: { columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'name', type: 'string', nullable: true }, { name: 'email', type: 'string', nullable: true }], primaryKey: ['id'] },
      files: { columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'name', type: 'string', nullable: true }, { name: 'size', type: 'number', nullable: true }], primaryKey: ['id'] },
      events: { columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'type', type: 'string', nullable: true }, { name: 'timestamp', type: 'datetime', nullable: true }], primaryKey: ['id'] }
    };
    return { name: table, ...(schemas[table] || { columns: [{ name: 'id', type: 'string', nullable: false }], primaryKey: ['id'] }) };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.apiKey) headers['Authorization'] = 'Bearer ' + this.apiKey;
      if (this.accessToken) headers['X-Access-Token'] = this.accessToken;
      
      const res = await fetch(this.baseUrl + '/api/v1/' + table + '?limit=' + this.batchSize, { headers });
      if (!res.ok) return [];
      const data = await res.json() as any;
      return (data.results || data.data || data || []).map((item: any) => 
        createEvent({ op: 'S', table, data: item, watermark: item.id || '' })
      );
    } catch { return []; }
  }

  async startCDC(): Promise<void> { throw new Error('CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}
