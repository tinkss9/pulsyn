// Mailchimp Connector — Real API Integration
// Auth: API key (usXX-XXXXXXXXXXXX)
// API: Mailchimp Marketing API 3.0
// Test: Free Mailchimp account (up to 500 contacts)

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('mailchimp-real')
export class MailchimpRealConnector extends BaseConnector {
  private baseUrl = '';
  private apiKey = '';
  private dc = '';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.apiKey = config.token || config.password || '';
    if (!this.apiKey) throw new Error('Mailchimp API key required');
    this.dc = this.apiKey.split('-').pop() || 'us1';
    this.baseUrl = `https://${this.dc}.api.mailchimp.com/3.0`;

    const resp = await this.mcGet('/ping');
    if (!resp.ok) throw new Error(`Mailchimp connection failed: HTTP ${resp.status}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; this.apiKey = ''; }
  async testConnection(): Promise<boolean> { try { return (await this.mcGet('/ping')).ok; } catch { return false; } }

  async getTables(): Promise<string[]> {
    return ['lists', 'members', 'campaigns', 'automations', 'segments', 'tags', 'reports'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schemas: Record<string, TableSchema> = {
      lists: { table: 'lists', primaryKeys: ['id'], columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false },
        { name: 'member_count', type: 'number', nullable: true },
        { name: 'date_created', type: 'string', nullable: false },
      ]},
      members: { table: 'members', primaryKeys: ['id'], columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'email_address', type: 'string', nullable: false },
        { name: 'status', type: 'string', nullable: false },
        { name: 'merge_fields', type: 'json', nullable: true },
        { name: 'stats', type: 'json', nullable: true },
        { name: 'timestamp_signup', type: 'string', nullable: true },
      ]},
      campaigns: { table: 'campaigns', primaryKeys: ['id'], columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'type', type: 'string', nullable: false },
        { name: 'status', type: 'string', nullable: false },
        { name: 'subject_line', type: 'string', nullable: true },
        { name: 'emails_sent', type: 'number', nullable: true },
        { name: 'send_time', type: 'string', nullable: true },
      ]},
    };
    return schemas[table] || { table, columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const endpoint = table === 'lists' ? '/lists' : table === 'members' ? '/lists/all/members' : `/${table}`;
    const resp = await this.mcGet(`${endpoint}?count=100`);
    if (!resp.ok) return [];
    const data = await resp.json();
    const items = data[table] || data.members || data.lists || data.campaigns || [];
    return items.map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.date_created || item.timestamp_signup }));
  }

  async extractIncremental(table: string, opts?: { watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    let endpoint = table === 'lists' ? '/lists' : table === 'members' ? '/lists/all/members' : `/${table}`;
    endpoint += '?count=100';
    if (opts?.watermarkValue) endpoint += `&since=${opts.watermarkValue}`;
    const resp = await this.mcGet(endpoint);
    if (!resp.ok) return [];
    const data = await resp.json();
    const items = data[table] || data.members || data.lists || [];
    return items.map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.date_created }));
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> { this.cdcActive = true; }
  async stopCDC(): Promise<void> { this.cdcActive = false; }

  private async mcGet(path: string): Promise<Response> {
    return fetch(`${this.baseUrl}${path}`, {
      headers: { 'Authorization': `apikey ${this.apiKey}`, 'Content-Type': 'application/json' },
    });
  }
}
