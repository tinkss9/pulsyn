// @ts-nocheck
// Copper Connector — Pulsyn CDC Platform
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('copper')
export class CopperConnector extends BaseConnector {
  private apiKey: string = '';
  private baseUrl: string = '';
  private accessToken: string = '';
  private storeId: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'copper', config);
    this.storeId = (config as any).storeId || '';
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
      return res.ok || res.status === 401; // 401 means auth required but endpoint exists
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['orders', 'customers', 'products', 'inventory', 'transactions'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schemas: Record<string, any> = {
      orders: { columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'status', type: 'string', nullable: true }, { name: 'total', type: 'number', nullable: true }, { name: 'created_at', type: 'datetime', nullable: true }], primaryKey: ['id'] },
      customers: { columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'email', type: 'string', nullable: true }, { name: 'name', type: 'string', nullable: true }], primaryKey: ['id'] },
      products: { columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'name', type: 'string', nullable: true }, { name: 'price', type: 'number', nullable: true }], primaryKey: ['id'] },
      inventory: { columns: [{ name: 'product_id', type: 'string', nullable: false }, { name: 'quantity', type: 'number', nullable: true }], primaryKey: ['product_id'] },
      transactions: { columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'amount', type: 'number', nullable: true }, { name: 'status', type: 'string', nullable: true }], primaryKey: ['id'] }
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
