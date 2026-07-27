// @ts-nocheck
// @vitest-environment node
// Integration test: Redis connector against Docker Redis (localhost:6379)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { skipIfNoDocker, getTestConfig, waitForService } from './docker-harness';
import { ConnectorRegistry } from '../../connectors/registry';
import '../../connectors/redis';
import type { UnifiedChangeEvent } from '../../events';

describe('Redis Live Integration', () => {
  let connector: any;
  const config = getTestConfig('redis');

  beforeAll(async () => {
    skipIfNoDocker('redis');
    await waitForService(config.host, config.port, 15000);
    connector = ConnectorRegistry.getSource('redis', 'test-redis', config);
    await connector.connect(config);
  });

  afterAll(async () => {
    if (connector?.isConnected()) {
      try {
        const client = connector.getClient();
        await client.flushdb();
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
    const client = connector.getClient();
    expect(client).toBeDefined();
    await client.set('test:key1', 'value1');
    await client.set('test:key2', 'value2');
    await client.set('test:key3', JSON.stringify({ name: 'Alice', score: 95 }));
    const val = await client.get('test:key1');
    expect(val).toBe('value1');
  });

  it('should extract keys as events', async () => {
    const events: UnifiedChangeEvent[] = await connector.extractFull('test:key3');
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].op).toBe('S');
    expect(events[0].table).toBe('test:key3');
    expect(events[0].after).toBeDefined();
    expect(events[0].after?.type).toBe('string');
  });

  it('should get table schema for a key', async () => {
    const schema = await connector.getTableSchema('test:key1');
    expect(schema.table).toBe('test:key1');
    expect(schema.columns.length).toBe(2);
  });

  it('should handle extractIncremental', async () => {
    const events = await connector.extractIncremental('test:key1');
    expect(Array.isArray(events)).toBe(true);
  });
});
