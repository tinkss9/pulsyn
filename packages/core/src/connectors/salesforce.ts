// Salesforce Connector — CRM SaaS source
// npm install jsforce

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let jsforce: any;
try { jsforce = require('jsforce'); } catch {}

@registerSource('salesforce')
export class SalesforceConnector extends BaseConnector {
  private conn: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'salesforce', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!jsforce) throw new Error('jsforce not installed');
    this.conn = new jsforce.Connection({ loginUrl: (config as any).loginUrl || 'https://login.salesforce.com' });
    await this.conn.login(config.user, config.password + (config as any).securityToken || '');
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.conn = null; this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.conn.query('SELECT Id FROM Account LIMIT 1'); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    const result = await this.conn.describeGlobal();
    return result.sobjects.filter((s: any) => s.queryable).map((s: any) => s.name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const desc = await this.conn.sobject(table).describe();
    return {
      name: table,
      columns: desc.fields.map((f: any) => ({ name: f.name, type: f.type, nullable: f.nillable })),
      primaryKey: ['Id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const result = await this.conn.query(`SELECT * FROM ${table} LIMIT ${this.batchSize}`);
    return (result.records || []).map((r: any) => {
      const { attributes, ...data } = r;
      return createEvent({ op: 'S', table, after: data, watermark: r.Id });
    });
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const soql = watermark
      ? `SELECT * FROM ${table} WHERE SystemModstamp > ${watermark} ORDER BY SystemModstamp LIMIT ${this.batchSize}`
      : `SELECT * FROM ${table} ORDER BY SystemModstamp LIMIT ${this.batchSize}`;
    const result = await this.conn.query(soql);
    return (result.records || []).map((r: any) => {
      const { attributes, ...data } = r;
      return createEvent({ op: 'I', table, after: data, watermark: r.SystemModstamp || r.Id });
    });
  }

  async startCDC(): Promise<void> { throw new Error('Salesforce CDC requires Streaming API / Platform Events — not yet implemented'); }
  async stopCDC(): Promise<void> {}
}


