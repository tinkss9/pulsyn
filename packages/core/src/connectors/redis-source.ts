// @ts-nocheck
import Redis from 'ioredis';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('redis')
export class RedisSourceConnector extends BaseConnector {
  private client: Redis | null = null;
  private subscriber: Redis | null = null;
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      this.client = new Redis({
        host: config.host || 'localhost',
        port: config.port || 6379,
        password: config.password || undefined,
        db: (config as any).db || 0,
        tls: config.ssl ? { rejectUnauthorized: false } : undefined,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
      });
      await this.client.connect();
      await this.client.ping();
      this.connected = true;
    } catch (error) {
      throw new Error(`Redis connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) return false;
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.client) throw new Error('Not connected');
    // In Redis, "tables" are key patterns/prefixes
    const keys: string[] = [];
    const prefixes = new Set<string>();
    let cursor = '0';

    do {
      const [nextCursor, batch] = await this.client.scan(cursor, 'COUNT', 1000);
      cursor = nextCursor;
      for (const key of batch) {
        const prefix = key.includes(':') ? key.split(':')[0] : key;
        prefixes.add(prefix);
      }
    } while (cursor !== '0' && prefixes.size < 1000);

    return Array.from(prefixes).sort();
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.client) throw new Error('Not connected');
    // Sample keys with this prefix to determine types
    const [, keys] = await this.client.scan(0, 'MATCH', `${table}:*`, 'COUNT', 10);
    const types = new Set<string>();

    for (const key of keys.slice(0, 10)) {
      const type = await this.client.type(key);
      types.add(type);
    }

    const columns = [
      { name: 'key', type: 'string', nullable: false, defaultValue: null },
      { name: 'value', type: Array.from(types).join('|') || 'string', nullable: true, defaultValue: null },
      { name: 'ttl', type: 'integer', nullable: true, defaultValue: null },
    ];
    return { table, columns, primaryKeys: ['key'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.client) throw new Error('Not connected');

    // Enable keyspace notifications if not already enabled
    await this.client.config('SET', 'notify-keyspace-events', 'KEA');

    this.subscriber = this.client.duplicate();
    await this.subscriber.connect();
    this.cdcActive = true;

    const db = (this.config as any).db || 0;
    await this.subscriber.psubscribe(`__keyevent@${db}__:*`);

    this.subscriber.on('pmessage', async (_pattern, channel, key) => {
      if (!this.cdcActive || !this.client) return;
      const eventType = channel.split(':').pop() || '';
      let op: 'I' | 'U' | 'D';

      if (['set', 'hset', 'lpush', 'rpush', 'sadd', 'zadd'].includes(eventType)) {
        op = 'I';
      } else if (['del', 'expired', 'evicted'].includes(eventType)) {
        op = 'D';
      } else {
        op = 'U';
      }

      let value: any = null;
      if (op !== 'D') {
        try { value = await this.getKeyValue(key); } catch { /* key may have expired */ }
      }

      callback({
        op, table: key.includes(':') ? key.split(':')[0] : 'default',
        before: op === 'D' ? { key } : null,
        after: op !== 'D' ? { key, value } : null,
        ts: new Date(),
      });
    });
  }

  private async getKeyValue(key: string): Promise<any> {
    if (!this.client) return null;
    const type = await this.client.type(key);
    switch (type) {
      case 'string': return await this.client.get(key);
      case 'hash': return await this.client.hgetall(key);
      case 'list': return await this.client.lrange(key, 0, -1);
      case 'set': return await this.client.smembers(key);
      case 'zset': return await this.client.zrange(key, 0, -1, 'WITHSCORES');
      default: return null;
    }
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.subscriber) {
      await this.subscriber.punsubscribe();
      this.subscriber.disconnect();
      this.subscriber = null;
    }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.client) throw new Error('Not connected');
    const events: UnifiedChangeEvent[] = [];
    let cursor = '0';
    const pattern = table === '*' ? '*' : `${table}:*`;

    do {
      const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', this.batchSize);
      cursor = nextCursor;

      for (const key of keys) {
        const value = await this.getKeyValue(key);
        const ttl = await this.client.ttl(key);
        events.push(createEvent('S', table, { key, value, ttl }, null, key, { source: 'redis' }));
      }
    } while (cursor !== '0');

    return events;
  }

  async extractIncremental(_table: string, _watermark: string | null): Promise<UnifiedChangeEvent[]> {
    // Redis has no native watermark — use CDC (keyspace notifications) for incremental
    throw new Error('Redis does not support watermark-based incremental extraction. Use CDC instead.');
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.client) throw new Error('Not connected');
    if (table === '*') {
      return await this.client.dbsize();
    }
    // Count keys with prefix — approximate via SCAN
    let count = 0;
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', `${table}:*`, 'COUNT', 10000);
      cursor = nextCursor;
      count += keys.length;
    } while (cursor !== '0');
    return count;
  }

  async getPrimaryKey(): Promise<string> {
    return 'key';
  }
}

