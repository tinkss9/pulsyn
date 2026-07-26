// NetSuite Connector — ERP SaaS source
// npm install node-suitetalk-client

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('netsuite')
export class NetSuiteConnector extends BaseConnector {
  private accountId: string = '';
  private auth: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'netsuite', config);
    this.accountId = (config as any).accountId || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.auth = 'NLAuth ' + `nlauth_account=${this.accountId},nlauth_email=${config.user},nlauth_signature=${config.password}`;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch(`https://${this.accountId}.suitetalk.api.netsuite.com/services/rest/record/v1/customer?limit=1`, { headers: { Authorization: this.auth } }); return r.ok; } catch { return false; } }

  async getTables(): Promise<string[]> { return ['customer', 'invoice', 'salesOrder', 'vendor', 'item', 'employee']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'entityId', type: 'string', nullable: true }, { name: 'companyName', type: 'string', nullable: true }], primaryKey: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`https://${this.accountId}.suitetalk.api.netsuite.com/services/rest/record/v1/${table}?limit=${this.batchSize}`, { headers: { Authorization: this.auth, Accept: 'application/json' } });
    const data = await res.json() as any;
    return (data.items || []).map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.id }));
  }

  async startCDC(): Promise<void> { throw new Error('NetSuite CDC requires SuiteScript or RESTlets — use polling'); }
  async stopCDC(): Promise<void> {}
}
