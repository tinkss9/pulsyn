// @ts-nocheck
// Workday Connector — HR/Finance SaaS source
// Uses Workday REST API

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('workday')
export class WorkdayConnector extends BaseConnector {
  private baseUrl: string = '';
  private accessToken: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'workday', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.baseUrl = `https://${config.host}/api/v1`;
    this.accessToken = config.password; // OAuth token
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch(`${this.baseUrl}/workers?limit=1`, { headers: { Authorization: `Bearer ${this.accessToken}` } }); return r.ok; } catch { return false; } }

  async getTables(): Promise<string[]> { return ['workers', 'jobs', 'positions', 'payroll', 'time_off', 'expenses']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'descriptor', type: 'string', nullable: true }], primaryKey: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`${this.baseUrl}/${table}?limit=${this.batchSize}`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
    const data = await res.json() as any;
    return (data.data || []).map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.id }));
  }

  async startCDC(): Promise<void> { throw new Error('Workday CDC requires Workday Web Services — use polling'); }
  async stopCDC(): Promise<void> {}
}



