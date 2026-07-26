// @ts-nocheck
// ServiceNow Connector — ITSM SaaS source
// npm install @servicenow/sdk-core

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('servicenow')
export class ServiceNowConnector extends BaseConnector {
  private baseUrl: string = '';
  private auth: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'servicenow', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.baseUrl = `https://${config.host}/api/now`;
    this.auth = 'Basic ' + Buffer.from(`${config.user}:${config.password}`).toString('base64');
    // Test connection
    const res = await fetch(`${this.baseUrl}/table/sys_user?sysparm_limit=1`, { headers: { Authorization: this.auth, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`ServiceNow connection failed: ${res.status}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const res = await fetch(`${this.baseUrl}/table/sys_user?sysparm_limit=1`, { headers: { Authorization: this.auth } }); return res.ok; } catch { return false; } }

  async getTables(): Promise<string[]> { return ['incident', 'change_request', 'problem', 'sys_user', 'cmdb_ci', 'sc_request']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    const res = await fetch(`${this.baseUrl}/table/${table}?sysparm_limit=1`, { headers: { Authorization: this.auth, Accept: 'application/json' } });
    const data = await res.json() as any;
    const first = data.result?.[0] || {};
    return {
      name: table,
      columns: Object.keys(first).map(k => ({ name: k, type: typeof first[k] === 'object' ? 'object' : typeof first[k], nullable: true })),
      primaryKey: ['sys_id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`${this.baseUrl}/table/${table}?sysparm_limit=${this.batchSize}`, { headers: { Authorization: this.auth, Accept: 'application/json' } });
    const data = await res.json() as any;
    return (data.result || []).map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.sys_id }));
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const query = watermark ? `sysparm_query=sys_updated_at>${watermark}&sysparm_limit=${this.batchSize}` : `sysparm_limit=${this.batchSize}`;
    const res = await fetch(`${this.baseUrl}/table/${table}?${query}`, { headers: { Authorization: this.auth, Accept: 'application/json' } });
    const data = await res.json() as any;
    return (data.result || []).map((item: any) => createEvent({ op: 'I', table, after: item, watermark: item.sys_updated_at || item.sys_id }));
  }

  async startCDC(): Promise<void> { throw new Error('ServiceNow CDC requires Business Rules or webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}



