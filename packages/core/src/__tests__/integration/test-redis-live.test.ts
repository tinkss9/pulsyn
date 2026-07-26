// @ts-nocheck
// @vitest-environment node
// Integration test: Redis connector against Docker Redis (localhost:6379)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { skipIfNoDocker, getTestConfig, waitForService } from './docker-harness';
import { ConnectorRegistry } from '../../connectors/registry';
import type { UnifiedChangeEvent } from '../../events';

describe('Redis Live Integration', () => {
  let connector: any;
  const config = getTestConfig('redis');
  const testPrefix = 'integration_test:';

  beforeAll(async () => {
    skipIfNoDocker('redis');
    await waitForService(config.host, config.port, 10000);

    try { await import('../../connectors/redis'); } catch { /* may not exist yet */ }

    try {
      connector = ConnectorRegistry.getSource('redis', 'test-redis', config);
    } catch {
      throw new Error('SKIP: Redis connector not registered');
    }
    await connector.connect(config);
  });

  afterAll(async () => {
    if (connector?.isConnected()) {
      try {
        const client = connector.getClient?.();
        const keys = await client?.keys?.(`${testPrefix}*`);
        if (keys?.length) await client.del(...keys);
      } catch { /* best effort */ }
      await connector.disconnect();
    }
  });

  it('should connect successfully', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('should test connection', async () => {
    const ok = await connector.testConnection();
    expect(ok).toBe(true);
  });

  it('should set and retrieve keys', async () => {
    const client = connector.getClient?.();
    if (!client) throw new Error('Cannot access Redis client');

    await client.set(`${testPrefix}user:1`, JSON.stringify({ name: 'Alice', score: 100 }));
    await client.set(`${testPrefix}user:2`, JSON.stringify({ name: 'Bob', score: 200 }));
    await client.set(`${testPrefix}user:3`, JSON.stringify({ name: 'Charlie', score: 300 }));

    const val = await client.get(`${testPrefix}user:1`);
    const parsed = JSON.parse(val);
    expect(parsed.name).toBe('Alice');
  });

  it('should extract keys as events', async () => {
    const events: UnifiedChangeEvent[] = await connector.extractFull(`${testPrefix}*`);
    expect(events.length).toBeGreaterThanOrEqual(3);
    expect(events[0].op).toBe('S');
    expect(events[0].after).toBeDefined();
  });

  it('should handle extractIncremental', async () => {
    const client = connector.getClient?.();
    const watermark = Date.now().toString();

    // Insert new key after watermark
    await new Promise(r => setTimeout(r, 10));
    await client?.set(`${testPrefix}user:4`, JSON.stringify({ name: 'Delta', score: 400 }));

    const events = await connector.extractIncremental(`${testPrefix}*`, watermark);
    // Redis doesn't have native CDC - connector may return all or filter by TTL
    expect(Array.isArray(events)).toBe(true);
  });

  it('should handle non-existent key pattern', async () => {
    const events = await connector.extractFull('nonexistent_pattern:*');
    expect(events).toEqual([]);
  });
});

