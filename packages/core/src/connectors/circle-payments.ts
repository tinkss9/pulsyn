// Circle (Crypto) Connector — USDC payment data
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('circle-payments')
export class CirclePaymentsConnector extends BaseConnector {
  private apiKey: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'circle-payments', config); }
  async connect(config: DatabaseConfig): Promise<void> { this.apiKey = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch('https://api.circle.com/v1/configuration', { headers: { Authorization: `Bearer ${this.apiKey}` } }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['payments', 'transfers', 'payouts', 'balances']; }
  async getTableSchema(table: string): Promise<TableSchema> { return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'status', type: 'string', nullable: true }, { name: 'amount', type: 'number', nullable: true }, { name: 'currency', type: 'string', nullable: true }], primaryKey: ['id'] }; }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const r = await fetch(`https://api.circle.com/v1/${table}?limit=100`, { headers: { Authorization: `Bearer ${this.apiKey}` } });
    const d = await r.json() as any;
    return (d.data || []).map((i: any) => createEvent({ op: 'S', table, after: i, watermark: i.id }));
  }
  async startCDC(): Promise<void> { throw new Error('Circle CDC requires webhooks'); }
  async stopCDC(): Promise<void> {}
}
