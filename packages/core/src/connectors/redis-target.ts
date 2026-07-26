// @ts-nocheck
import Redis from 'ioredis';
import { BaseConnector } from './base';
import { registerTarget } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerTarget('redis')
export class RedisTargetConnector extends BaseConnector {
  private client: Redis | null = null;
  private keyPrefix: string = '';
  private ttl: number = 0; // 0 = no expiry

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 'redis', config, options?.batchSize || 10000);
    if (options?.keyPrefix) this.keyPrefix = options.keyPrefix;
    if (options?.ttl) this.ttl = options.ttl;
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;

    const redisOpts: any = {
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password || undefined,
      db: (config as any).db || 0,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 200, 5000),
      lazyConnect: true,
      enableReadyCheck: true,
      connectTimeout: 10000,
    };

    if (config.ssl) {
      redisOpts.tls = { rejectUnauthorized: false };
    }

    this.client = new Redis(redisOpts);
    await this.client.connect();
    await this.client.ping();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
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
    // Redis doesn't have tables — scan for key patterns
    if (!this.client) throw new Error('Not connected');
    const keys = new Set<string>();
    let cursor = '0';
    do {
      const [next, batch] = await this.client.scan(cursor, 'MATCH', `${this.keyPrefix}*`, 'COUNT', 100);
      cursor = next;
      for (const key of batch) {
        const parts = key.split(':');
        if (parts.length >= 2) keys.add(parts[0]);
      }
    } while (cursor !== '0' && keys.size < 1000);
    return Array.from(keys);
  }

  async getTableSchema(_table: string): Promise<TableSchema> {
    // Redis is schemaless
    return { table: _table, columns: [], primaryKeys: [] };
  }

  async startCDC(_cb: (event: CDCEvent) => void): Promise<void> {
    throw new Error('Redis target does not support CDC read');
  }
  async stopCDC(): Promise<void> {}

  async createTableIfNeeded(_table: string, _schema: Record<string, any>): Promise<void> {
    // No-op for Redis — keys created on write
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    if (!this.client) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => ({ after: e.after!, meta: e.sourceMetadata }));
    if (rows.length === 0) return 0;

    let written = 0;

    for (let i = 0; i < rows.length; i += this.batchSize) {
      const batch = rows.slice(i, i + this.batchSize);
      const pipeline = this.client.pipeline();

      for (const { after, meta } of batch) {
        const pk = this.extractPKValue(after, meta);
        const redisKey = this.buildKey(table, pk);
        const fieldValues = this.flattenToStringPairs(after);

        if (fieldValues.length > 0) {
          pipeline.hset(redisKey, ...fieldValues);
          if (this.ttl > 0) {
            pipeline.expire(redisKey, this.ttl);
          }
        }
      }

      const results = await pipeline.exec();
      if (results) {
        const errors = results.filter(([err]) => err !== null);
        written += batch.length - errors.length;
      }
    }
    return written;
  }

  async merge(table: string, events: UnifiedChangeEvent[], keyColumns: string[]): Promise<number> {
    // HSET is idempotent — merge is same as write
    if (!this.client) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => ({ after: e.after!, meta: e.sourceMetadata }));
    if (rows.length === 0) return 0;

    let merged = 0;

    for (let i = 0; i < rows.length; i += this.batchSize) {
      const batch = rows.slice(i, i + this.batchSize);
      const pipeline = this.client.pipeline();

      for (const { after, meta } of batch) {
        // Use keyColumns for PK derivation
        const pkValue = keyColumns.length > 0
          ? keyColumns.map((k) => after[k]).join(':')
          : this.extractPKValue(after, meta);
        const redisKey = this.buildKey(table, pkValue);
        const fieldValues = this.flattenToStringPairs(after);

        if (fieldValues.length > 0) {
          pipeline.hset(redisKey, ...fieldValues);
          if (this.ttl > 0) {
            pipeline.expire(redisKey, this.ttl);
          }
        }
      }

      const results = await pipeline.exec();
      if (results) {
        const errors = results.filter(([err]) => err !== null);
        merged += batch.length - errors.length;
      }
    }
    return merged;
  }

  private buildKey(table: string, pk: string): string {
    const prefix = this.keyPrefix ? `${this.keyPrefix}:` : '';
    return `${prefix}${table}:${pk}`;
  }

  private extractPKValue(row: Record<string, any>, meta?: Record<string, any>): string {
    if (meta?.pk) return String(meta.pk);
    for (const key of ['id', 'ID', '_id', 'pk', 'key']) {
      if (row[key] !== undefined) return String(row[key]);
    }
    // Fallback: hash of first few values
    return Object.values(row).slice(0, 3).join(':');
  }

  private flattenToStringPairs(row: Record<string, any>): (string | Buffer | number)[] {
    const pairs: (string | Buffer | number)[] = [];
    for (const [k, v] of Object.entries(row)) {
      if (v === null || v === undefined) {
        pairs.push(k, '');
      } else if (v instanceof Date) {
        pairs.push(k, v.toISOString());
      } else if (typeof v === 'object') {
        pairs.push(k, JSON.stringify(v));
      } else {
        pairs.push(k, String(v));
      }
    }
    return pairs;
  }
}

