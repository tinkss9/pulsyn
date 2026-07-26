// @ts-nocheck
// @vitest-environment node
// Integration test: MongoDB connector against Docker Mongo (localhost:27017)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { skipIfNoDocker, getTestConfig, waitForService } from './docker-harness';
import { ConnectorRegistry } from '../../connectors/registry';
import type { UnifiedChangeEvent } from '../../events';

describe('MongoDB Live Integration', () => {
  let connector: any;
  const testCollection = 'integration_test_products';
  const config = getTestConfig('mongodb');

  beforeAll(async () => {
    skipIfNoDocker('mongodb');
    await waitForService(config.host, config.port, 15000);

    // Dynamically import mongo connector if it exists
    try { await import('../../connectors/mongodb'); } catch { /* may not exist yet */ }

    // Try to get connector from registry, fall back to manual instantiation
    try {
      connector = ConnectorRegistry.getSource('mongodb', 'test-mongo', config);
    } catch {
      // If not registered, test will fail gracefully
      throw new Error('SKIP: MongoDB connector not registered');
    }
    await connector.connect(config);
  });

  afterAll(async () => {
    if (connector?.isConnected()) {
      try {
        const db = connector.getDb?.();
        await db?.collection(testCollection).drop();
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

  it('should list collections', async () => {
    const tables = await connector.getTables();
    expect(Array.isArray(tables)).toBe(true);
  });

  it('should insert documents and extractFull', async () => {
    const db = connector.getDb?.();
    if (!db) throw new Error('Cannot access MongoDB database handle');

    const collection = db.collection(testCollection);
    await collection.insertMany([
      { name: 'Widget', price: 9.99, category: 'gadgets', createdAt: new Date() },
      { name: 'Gizmo', price: 19.99, category: 'gadgets', createdAt: new Date() },
      { name: 'Doohickey', price: 5.49, category: 'parts', createdAt: new Date() },
    ]);

    const events: UnifiedChangeEvent[] = await connector.extractFull(testCollection);
    expect(events.length).toBeGreaterThanOrEqual(3);
    expect(events[0].op).toBe('S');
    expect(events[0].table).toBe(testCollection);
    expect(events[0].after?.name).toBeDefined();
  });

  it('should get collection schema', async () => {
    const schema = await connector.getTableSchema(testCollection);
    expect(schema.table).toBe(testCollection);
    expect(schema.columns.length).toBeGreaterThan(0);
  });

  it('should extractIncremental after new inserts', async () => {
    const fullEvents = await connector.extractFull(testCollection);
    const lastWatermark = fullEvents[fullEvents.length - 1]?.watermark;

    const db = connector.getDb?.();
    const collection = db.collection(testCollection);
    await collection.insertOne({ name: 'NewItem', price: 42.00, category: 'new', createdAt: new Date() });

    const incEvents = await connector.extractIncremental(testCollection, lastWatermark);
    expect(incEvents.length).toBeGreaterThanOrEqual(1);
    const names = incEvents.map((e: UnifiedChangeEvent) => e.after?.name);
    expect(names).toContain('NewItem');
  });

  it('should handle empty collection', async () => {
    const db = connector.getDb?.();
    await db?.createCollection('empty_mongo_test');
    const events = await connector.extractFull('empty_mongo_test');
    expect(events).toEqual([]);
    await db?.collection('empty_mongo_test').drop();
  });
});

