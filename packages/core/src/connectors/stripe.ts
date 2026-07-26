// Stripe Connector — payments SaaS source
// npm install stripe

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let Stripe: any;
try { Stripe = require('stripe'); } catch {}

@registerSource('stripe')
export class StripeConnector extends BaseConnector {
  private client: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'stripe', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!Stripe) throw new Error('stripe not installed');
    this.client = new Stripe(config.password); // API key as password
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.balance.retrieve(); return true; } catch { return false; } }

  async getTables(): Promise<string[]> { return ['customers', 'invoices', 'charges', 'subscriptions', 'products', 'prices']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'object', type: 'string', nullable: true }, { name: 'created', type: 'datetime', nullable: true }, { name: 'livemode', type: 'boolean', nullable: true }], primaryKey: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const listMethod = (this.client as any)[table]?.list;
    if (!listMethod) throw new Error(`Unsupported Stripe table: ${table}`);
    const result = await listMethod.call((this.client as any)[table], { limit: 100 });
    return (result.data || []).map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.id }));
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const params: any = { limit: 100 };
    if (watermark) params.starting_after = watermark;
    const listMethod = (this.client as any)[table]?.list;
    if (!listMethod) throw new Error(`Unsupported Stripe table: ${table}`);
    const result = await listMethod.call((this.client as any)[table], params);
    return (result.data || []).map((item: any) => createEvent({ op: 'I', table, after: item, watermark: item.id }));
  }

  async startCDC(): Promise<void> { throw new Error('Stripe CDC requires webhooks — use polling-based extraction'); }
  async stopCDC(): Promise<void> {}
}


