// Redis Connector — cache/session store source
// npm install ioredis

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let Redis: any;
try { Redis = require('ioredis'); } catch {}

@registerSource('redis')
export class RedisConnector extends BaseConnector {
  private client: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'redis', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!Redis) throw new Error('ioredis not installed');
    this.client = new Redis({ host: config.host, port: config.port || 6379, password: config.password, db: parseInt(config.database || '0') });
    this.connected = true;
  }

  async disconnect(): Promise<void> { if (this.client) { this.client.disconnect(); this.client = null; } this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.ping(); return true; } catch { return false; } }
  async getTables(): Promise<string[]> { return ['keys']; }
  async getTableSchema(table: string): Promise<TableSchema> { return { name: table, columns: [{ name: 'key', type: 'string', nullable: false }, { name: 'value', type: 'string', nullable: true }], primaryKey: ['key'] }; }

  async extractFull(): Promise<UnifiedChangeEvent[]> {
    const keys = await this.client.keys('*');
    const events: UnifiedChangeEvent[] = [];
    for (const key of keys.slice(0, this.batchSize)) {
      const value = await this.client.get(key);
      events.push(createEvent({ op: 'S', table: 'keys', after: { key, value }, watermark: key }));
    }
    return events;
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    // Redis keyspace notifications
    await this.client.config('SET', 'notify-keyspace-events', 'KEA');
    const sub = new Redis({ host: this.config.host, port: this.config.port || 6379, password: this.config.password });
    await sub.subscribe('__keyevent@0__:set', '__keyevent@0__:del');
    sub.on('message', (channel: string, key: string) => {
      const op = channel.includes('set') ? 'INSERT' : 'DELETE';
      callback({ id: `redis-${Date.now()}`, operation: op as any, table: 'keys', timestamp: new Date(), data: { key }, lsn: key });
    });
  }

  async stopCDC(): Promise<void> {}
}
