// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface SlackConfig extends DatabaseConfig {
  botToken: string;
  channelIds?: string[];
}

@registerSource('slack')
export class SlackConnector extends BaseConnector {
  private baseUrl = 'https://slack.com/api';
  private botToken = '';
  private channelIds: string[] = [];
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  private readonly resources = ['messages', 'users', 'channels', 'reactions', 'files'];

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const sc = config as SlackConfig;
    this.botToken = sc.botToken;
    this.channelIds = sc.channelIds || [];

    const ok = await this.testConnection();
    if (!ok) throw new Error('Slack connection test failed');

    // Discover channels if not provided
    if (this.channelIds.length === 0) {
      this.channelIds = await this.discoverChannels();
    }
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.slackFetch('/auth.test');
      if (!res.ok) return false;
      const data = await res.json() as any;
      return data.ok === true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return [...this.resources];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schemas: Record<string, string[]> = {
      messages: ['ts', 'text', 'user', 'channel', 'type', 'thread_ts', 'reply_count'],
      users: ['id', 'name', 'real_name', 'email', 'is_admin', 'is_bot', 'updated'],
      channels: ['id', 'name', 'topic', 'purpose', 'num_members', 'created'],
      reactions: ['name', 'count', 'users', 'message_ts', 'channel'],
      files: ['id', 'name', 'title', 'mimetype', 'size', 'user', 'created'],
    };
    const fields = schemas[table] || ['id'];
    const columns = fields.map(name => ({ name, type: 'string', nullable: true, defaultValue: null }));
    return { table, columns, primaryKeys: ['id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const watermarks: Record<string, string> = {};

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        for (const channelId of this.channelIds.slice(0, 10)) {
          const oldest = watermarks[channelId] || (Date.now() / 1000 - 60).toString();
          const params = new URLSearchParams({ channel: channelId, oldest, limit: '100' });
          const res = await this.slackFetch(`/conversations.history?${params}`);
          if (!res.ok) continue;
          const data = await res.json() as any;
          if (!data.ok) continue;
          for (const msg of data.messages || []) {
            callback({ op: 'I', table: 'messages', before: null, after: { ...msg, channel: channelId }, ts: new Date() });
            if (parseFloat(msg.ts) > parseFloat(watermarks[channelId] || '0')) {
              watermarks[channelId] = msg.ts;
            }
          }
        }
      } catch { /* retry */ }
    }, 5000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    switch (table) {
      case 'messages': return this.extractMessages(null);
      case 'users': return this.extractUsers();
      case 'channels': return this.extractChannels();
      case 'files': return this.extractFiles(null);
      default: return [];
    }
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    switch (table) {
      case 'messages': return this.extractMessages(watermark);
      case 'users': return this.extractUsers();
      case 'channels': return this.extractChannels();
      case 'files': return this.extractFiles(watermark);
      default: return [];
    }
  }

  private async extractMessages(watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const oldest = watermark || (Date.now() / 1000 - 86400).toString();

    for (const channelId of this.channelIds) {
      let cursor: string | undefined = undefined;
      while (true) {
        const params = new URLSearchParams({ channel: channelId, oldest, limit: '200' });
        if (cursor) params.set('cursor', cursor);

        const res = await this.slackFetch(`/conversations.history?${params}`);
        if (!res.ok) break;
        const data = await res.json() as any;
        if (!data.ok) break;

        for (const msg of data.messages || []) {
          events.push(createEvent({
            op: watermark ? 'I' : 'S', table: 'messages', after: { ...msg, channel: channelId },
            watermark: msg.ts,
            sourceMetadata: { source: 'slack', channel: channelId },
          }));
        }

        cursor = data.response_metadata?.next_cursor;
        if (!cursor || (data.messages || []).length === 0) break;
      }
    }
    return events;
  }

  private async extractUsers(): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    let cursor: string | undefined = undefined;

    while (true) {
      const params = new URLSearchParams({ limit: '200' });
      if (cursor) params.set('cursor', cursor);

      const res = await this.slackFetch(`/users.list?${params}`);
      if (!res.ok) break;
      const data = await res.json() as any;
      if (!data.ok) break;

      for (const user of data.members || []) {
        events.push(createEvent({
          op: 'S', table: 'users', after: user,
          watermark: user.id,
          sourceMetadata: { source: 'slack' },
        }));
      }

      cursor = data.response_metadata?.next_cursor;
      if (!cursor || (data.members || []).length === 0) break;
    }
    return events;
  }

  private async extractChannels(): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    let cursor: string | undefined = undefined;

    while (true) {
      const params = new URLSearchParams({ limit: '200', types: 'public_channel,private_channel' });
      if (cursor) params.set('cursor', cursor);

      const res = await this.slackFetch(`/conversations.list?${params}`);
      if (!res.ok) break;
      const data = await res.json() as any;
      if (!data.ok) break;

      for (const channel of data.channels || []) {
        events.push(createEvent({
          op: 'S', table: 'channels', after: channel,
          watermark: channel.id,
          sourceMetadata: { source: 'slack' },
        }));
      }

      cursor = data.response_metadata?.next_cursor;
      if (!cursor || (data.channels || []).length === 0) break;
    }
    return events;
  }

  private async extractFiles(watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const tsFrom = watermark ? parseInt(watermark, 10) : Math.floor(Date.now() / 1000) - 86400;
    let page = 1;

    while (true) {
      const params = new URLSearchParams({ ts_from: tsFrom.toString(), count: '100', page: page.toString() });
      const res = await this.slackFetch(`/files.list?${params}`);
      if (!res.ok) break;
      const data = await res.json() as any;
      if (!data.ok) break;

      for (const file of data.files || []) {
        events.push(createEvent({
          op: watermark ? 'I' : 'S', table: 'files', after: file,
          watermark: file.created?.toString() || null,
          sourceMetadata: { source: 'slack' },
        }));
      }

      if (page >= (data.paging?.pages || 1)) break;
      page++;
    }
    return events;
  }

  private async discoverChannels(): Promise<string[]> {
    const res = await this.slackFetch('/conversations.list?types=public_channel,private_channel&limit=100');
    if (!res.ok) return [];
    const data = await res.json() as any;
    if (!data.ok) return [];
    return (data.channels || []).map((c: any) => c.id);
  }

  private async slackFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.botToken}`,
      'Content-Type': 'application/json; charset=utf-8',
      ...(init?.headers as Record<string, string> || {}),
    };
    return this.fetchWithRetry(url, { ...init, headers });
  }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch(url, init);
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10);
        await this.sleep(retryAfter * 1000);
        continue;
      }
      if (res.status >= 500 && i < retries) {
        await this.sleep(Math.min(1000 * Math.pow(2, i), 30000));
        continue;
      }
      return res;
    }
    throw new Error('Slack: max retries exceeded');
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

