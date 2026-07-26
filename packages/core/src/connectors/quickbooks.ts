// QuickBooks Connector — accounting SaaS source
// npm install node-quickbooks

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let QuickBooks: any;
try { QuickBooks = require('node-quickbooks'); } catch {}

@registerSource('quickbooks')
export class QuickBooksConnector extends BaseConnector {
  private qbo: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'quickbooks', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!QuickBooks) throw new Error('node-quickbooks not installed');
    this.qbo = new QuickBooks(
      config.user, // clientId
      config.password, // clientSecret
      (config as any).refreshToken || '',
      (config as any).sandbox || false,
      (config as any).realmId || ''
    );
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.qbo = null; this.connected = false; }
  async testConnection(): Promise<boolean> { try { await new Promise((res, rej) => this.qbo.findAccounts({}, (err: any, accs: any) => err ? rej(err) : res(accs))); return true; } catch { return false; } }

  async getTables(): Promise<string[]> { return ['Account', 'Customer', 'Invoice', 'Payment', 'Bill', 'Item', 'Vendor']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, columns: [{ name: 'Id', type: 'string', nullable: false }, { name: 'Name', type: 'string', nullable: true }, { name: 'MetaData', type: 'object', nullable: true }], primaryKey: ['Id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const query = `SELECT * FROM ${table} MAXRESULTS ${this.batchSize}`;
    const result = await new Promise<any>((res, rej) => this.qbo.query(query, (err: any, rows: any) => err ? rej(err) : res(rows)));
    return (result.QueryResponse?.[table] || []).map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.Id }));
  }

  async startCDC(): Promise<void> { throw new Error('QuickBooks CDC requires webhooks — use polling-based extraction'); }
  async stopCDC(): Promise<void> {}
}
