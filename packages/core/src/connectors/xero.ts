// Xero Connector — accounting SaaS API source
// npm install xero-node

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let XeroClient: any;
try { XeroClient = require('xero-node').XeroClient; } catch {}

@registerSource('xero')
export class XeroConnector extends BaseConnector {
  private client: any = null;
  private tenantId: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'xero', config);
    this.tenantId = (config as any).tenantId || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!XeroClient) throw new Error('xero-node not installed');
    this.client = new XeroClient({
      clientId: config.user, clientSecret: config.password,
      redirectUris: ['http://localhost:3000/callback'],
      scopes: ['accounting.transactions.read', 'accounting.contacts.read'],
    });
    // Requires OAuth flow — for now, use stored token
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.accountingApi.getOrganisations(this.tenantId); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    return ['Invoices', 'Contacts', 'Accounts', 'BankTransactions', 'Payments', 'Items'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: true },
        { name: 'status', type: 'string', nullable: true },
        { name: 'updatedDateUTC', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    let result;
    switch (table.toLowerCase()) {
      case 'invoices': result = await this.client.accountingApi.getInvoices(this.tenantId); break;
      case 'contacts': result = await this.client.accountingApi.getContacts(this.tenantId); break;
      case 'accounts': result = await this.client.accountingApi.getAccounts(this.tenantId); break;
      default: throw new Error(`Unsupported Xero table: ${table}`);
    }
    return (result.body || []).map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.InvoiceID || item.ContactID || item.AccountID || '' }));
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const modifiedAfter = watermark ? new Date(watermark) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let result;
    switch (table.toLowerCase()) {
      case 'invoices': result = await this.client.accountingApi.getInvoices(this.tenantId, undefined, undefined, undefined, undefined, undefined, undefined, modifiedAfter); break;
      case 'contacts': result = await this.client.accountingApi.getContacts(this.tenantId, undefined, undefined, undefined, modifiedAfter); break;
      default: throw new Error(`Unsupported Xero table: ${table}`);
    }
    return (result.body || []).map((item: any) => createEvent({ op: 'I', table, after: item, watermark: item.UpdatedDateUTC || '' }));
  }

  async startCDC(): Promise<void> { throw new Error('Xero CDC not supported — use polling-based incremental extraction'); }
  async stopCDC(): Promise<void> {}
}
