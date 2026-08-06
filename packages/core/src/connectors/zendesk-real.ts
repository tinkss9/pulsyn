// Zendesk Connector — Real API Integration
// Auth: API token + email
// API: Zendesk REST API v2
// Test: Free Zendesk trial (14 days) or Zendesk Suite Growth

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('zendesk-real')
export class ZendeskRealConnector extends BaseConnector {
  private baseUrl = '';
  private email = '';
  private token = '';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.baseUrl = config.host || '';
    this.email = config.username || '';
    this.token = config.token || config.password || '';
    if (!this.baseUrl || !this.token) throw new Error('Zendesk subdomain and API token required');

    const resp = await this.zdGet('/tickets.json?per_page=1');
    if (!resp.ok) throw new Error(`Zendesk connection failed: HTTP ${resp.status}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; this.token = ''; }
  async testConnection(): Promise<boolean> { try { return (await this.zdGet('/tickets.json?per_page=1')).ok; } catch { return false; } }

  async getTables(): Promise<string[]> {
    return ['tickets', 'users', 'organizations', 'groups', 'ticket_fields', 'satisfaction_ratings'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schemas: Record<string, TableSchema> = {
      tickets: { table: 'tickets', primaryKeys: ['id'], columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'subject', type: 'string', nullable: false },
        { name: 'status', type: 'string', nullable: false },
        { name: 'priority', type: 'string', nullable: true },
        { name: 'requester_id', type: 'number', nullable: false },
        { name: 'assignee_id', type: 'number', nullable: true },
        { name: 'created_at', type: 'string', nullable: false },
        { name: 'updated_at', type: 'string', nullable: false },
      ]},
      users: { table: 'users', primaryKeys: ['id'], columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false },
        { name: 'email', type: 'string', nullable: false },
        { name: 'role', type: 'string', nullable: true },
        { name: 'created_at', type: 'string', nullable: false },
      ]},
    };
    return schemas[table] || { table, columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const resp = await this.zdGet(`/${table}.json?per_page=100`);
    if (!resp.ok) return [];
    const data = await resp.json();
    const items = data[table] || [];
    return items.map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.updated_at || item.created_at }));
  }

  async extractIncremental(table: string, opts?: { watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    let url = `/${table}.json?per_page=100`;
    if (opts?.watermarkValue) url += `&start_time=${Math.floor(new Date(opts.watermarkValue).getTime() / 1000)}`;
    const resp = await this.zdGet(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    const items = data[table] || [];
    return items.map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.updated_at }));
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> { this.cdcActive = true; }
  async stopCDC(): Promise<void> { this.cdcActive = false; }

  private async zdGet(path: string): Promise<Response> {
    const auth = Buffer.from(`${this.email}/token:${this.token}`).toString('base64');
    return fetch(`${this.baseUrl}/api/v2${path}`, {
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
    });
  }
}
