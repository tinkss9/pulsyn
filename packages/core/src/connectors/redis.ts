// @ts-nocheck
import Redis from 'ioredis';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('redis')
export class RedisConnector extends BaseConnector {
  private client!: Redis;
  private subscriber!: Redis;
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const opts: any = {
      host: config.host,
      port: config.port || 6379,
      db: parseInt(String(config.database || 0), 10) || 0,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 200, 2000),
    };
    if (config.password) opts.password = config.password;

    this.client = new Redis(opts);
    this.subscriber = new Redis(opts);
    try {
      await this.client.ping();
      this.connected = true;
    } catch (error) {
      throw new Error(`Redis connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.stopCDC();
      await this.subscriber.quit();
      await this.client.quit();
      this.connected = false;
    } catch (error) {
      throw new Error(`Redis disconnect failed: ${(error as Error).message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async query(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async getTables(): Promise<string[]> {
    return await this.client.keys('*');
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const type = await this.client.type(table);
    return {
      name: table,
      table,
      columns: [{ name: 'key', type: 'string', nullable: false, defaultValue: null },
                 { name: 'value', type: type, nullable: false, defaultValue: null }],
      primaryKey: ['key'],
      primaryKeys: ['key'],
    };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    await this.subscriber.config('SET', 'notify-keyspace-events', 'AKE');
    await this.subscriber.psubscribe('__keyevent@*__:*');
    this.subscriber.on('pmessage', async (_pattern: string, _channel: string, key: string) => {
      if (!this.cdcActive) return;
      const type = _channel.split(':')[1] || 'unknown';
      let op: 'I' | 'U' | 'D' = 'I';
      if (type === 'del' || type === 'expired') op = 'D';
      else if (type === 'set') op = 'U';
      callback({ op, table: key, after: null, before: null, ts: new Date() });
    });
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    try { await this.subscriber.punsubscribe(); } catch { /* best effort */ }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const type = await this.client.type(table);
    let value: any;
    switch (type) {
      case 'string': value = await this.client.get(table); break;
      case 'list': value = await this.client.lrange(table, 0, -1); break;
      case 'set': value = await this.client.smembers(table); break;
      case 'zset': value = await this.client.zrange(table, 0, -1, 'WITHSCORES'); break;
      case 'hash': value = await this.client.hgetall(table); break;
      default: value = null;
    }
    return [createEvent({ op: 'S', table, after: { key: table, value, type }, before: null, sourceMetadata: { source: 'redis' } })];
  }

  async extractIncremental(_table: string): Promise<UnifiedChangeEvent[]> {
    return [];
  }

  async estimateRowCount(_table: string): Promise<number> {
    return await this.client.dbsize();
  }

  async getPrimaryKey(): Promise<string> {
    return 'key';
  }
}
