// Slack Connector — Real API Integration
// Auth: Bot token (xoxb-*) or User token (xoxp-*)
// API: Slack Web API
// Test: Free Slack workspace + app

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('slack-real')
export class SlackRealConnector extends BaseConnector {
  private baseUrl = 'https://slack.com/api';
  private token = '';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.token = config.token || config.password || '';
    if (!this.token) throw new Error('Slack bot or user token required (xoxb-* or xoxp-*)');
    const resp = await this.slackGet('auth.test');
    if (!resp.ok || !(await resp.json()).ok) throw new Error('Slack connection failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; this.token = ''; }
  async testConnection(): Promise<boolean> {
    try { const r = await this.slackGet('auth.test'); return r.ok && (await r.json()).ok; } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['channels', 'messages', 'users', 'threads', 'files', 'reactions', 'usergroups'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schemas: Record<string, TableSchema> = {
      channels: { table: 'channels', primaryKeys: ['id'], columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false },
        { name: 'is_channel', type: 'boolean', nullable: true },
        { name: 'is_private', type: 'boolean', nullable: true },
        { name: 'created', type: 'number', nullable: false },
        { name: 'num_members', type: 'number', nullable: true },
      ]},
      messages: { table: 'messages', primaryKeys: ['ts'], columns: [
        { name: 'ts', type: 'string', nullable: false, primaryKey: true },
        { name: 'type', type: 'string', nullable: false },
        { name: 'user', type: 'string', nullable: true },
        { name: 'text', type: 'string', nullable: true },
        { name: 'channel', type: 'string', nullable: true },
        { name: 'thread_ts', type: 'string', nullable: true },
      ]},
      users: { table: 'users', primaryKeys: ['id'], columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false },
        { name: 'real_name', type: 'string', nullable: true },
        { name: 'profile.email', type: 'string', nullable: true },
        { name: 'is_bot', type: 'boolean', nullable: true },
      ]},
    };
    return schemas[table] || { table, columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const endpoint = table === 'channels' ? 'conversations.list' : table === 'users' ? 'users.list' : 'conversations.history';
    let params: Record<string, string> = { limit: '100' };
    if (table === 'messages') params = { ...params, channel: this.config.channel || '' };

    const resp = await this.slackGet(endpoint, params);
    if (!resp.ok) return [];
    const data = await resp.json();
    const items = data.channels || data.users || data.messages || [];
    return items.map((item: any) => createEvent({ op: 'S', table, after: item, watermark: item.ts || item.created }));
  }

  async extractIncremental(table: string, opts?: { watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    if (table === 'messages' && opts?.watermarkValue) {
      const resp = await this.slackGet('conversations.history', { channel: this.config.channel || '', oldest: opts.watermarkValue, limit: '100' });
      if (!resp.ok) return [];
      const data = await resp.json();
      return (data.messages || []).map((m: any) => createEvent({ op: 'S', table, after: m, watermark: m.ts }));
    }
    return this.extractFull(table);
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> { this.cdcActive = true; }
  async stopCDC(): Promise<void> { this.cdcActive = false; }

  private async slackGet(method: string, params?: Record<string, string>): Promise<Response> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(`${this.baseUrl}/${method}${qs}`, {
      headers: { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' },
    });
  }
}
