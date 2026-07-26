// @ts-nocheck
// Microsoft Teams Connector
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('microsoft-teams')
export class MicrosoftTeamsConnector extends BaseConnector {
  private token: string = '';
  constructor(id: string, name: string, config: DatabaseConfig) { super(id, name, 'microsoft-teams', config); }
  async connect(config: DatabaseConfig): Promise<void> { this.token = config.password; this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> { try { const r = await fetch('https://graph.microsoft.com/v1.0/me', { headers: { Authorization: `Bearer ${this.token}` } }); return r.ok; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['teams', 'channels', 'messages']; }
  async getTableSchema(table: string): Promise<TableSchema> { return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'displayName', type: 'string', nullable: true }], primaryKey: ['id'] }; }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const r = await fetch(`https://graph.microsoft.com/v1.0/${table}`, { headers: { Authorization: `Bearer ${this.token}` } });
    const d = await r.json() as any;
    return (d.value || []).map((i: any) => createEvent({ op: 'S', table, after: i, watermark: i.id }));
  }
  async startCDC(): Promise<void> { throw new Error('Teams CDC requires webhooks'); }
  async stopCDC(): Promise<void> {}
}



