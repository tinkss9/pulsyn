// Airtable Connector — no-code database source
// npm install airtable

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let Airtable: any;
try { Airtable = require('airtable'); } catch {}

@registerSource('airtable')
export class AirtableConnector extends BaseConnector {
  private base: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'airtable', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!Airtable) throw new Error('airtable not installed');
    const at = Airtable.configure({ apiKey: config.password });
    this.base = at.base((config as any).baseId || config.database);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.base = null; this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.base('test').select({ maxRecords: 1 }).firstPage(); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    // Airtable doesn't have a list tables API — use configured tables
    return (this.config as any).tables || ['Table 1'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const records = await this.base(table).select({ maxRecords: 1 }).firstPage();
    const first = records[0]?.fields || {};
    return {
      name: table,
      columns: Object.keys(first).map(k => ({ name: k, type: typeof first[k], nullable: true })),
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const records = await this.base(table).select({ maxRecords: this.batchSize }).all();
    return records.map((r: any) => createEvent({ op: 'S', table, after: { id: r.id, ...r.fields }, watermark: r.id }));
  }

  async startCDC(): Promise<void> { throw new Error('Airtable CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}


