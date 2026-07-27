// @ts-nocheck
// @vitest-environment node
// Integration test: MongoDB target writer — writeBatch, merge

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { skipIfNoDocker, getTestConfig, waitForService } from './docker-harness';
import { ConnectorRegistry } from '../../connectors/registry';
import '../../connectors/mongodb-target';
import { createEvent } from '../../events';
import type { UnifiedChangeEvent } from '../../events';

describe('MongoDB Target Writer Integration', () => {
  let connector: any;
  const targetCollection = 'target_test_events';
  const config = getTestConfig('mongodb');

  beforeAll(async () => {
    skipIfNoDocker('mongodb');
    await waitForService(config.host, config.port, 15000);
    connector = ConnectorRegistry.getTarget('mongodb', 'test-mongo-target', config);
    await connector.connect(config);
  });

  afterAll(async () => {
    if (connector?.isConnected()) {
      try {
        const db = connector.getDb();
        if (db) await db.dropCollection(targetCollection).catch(() => {});
      } catch { /* best effort */ }
      await connector.disconnect();
    }
  });

  it('should connect successfully', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('should create target collection', async () => {
    const db = connector.getDb();
    expect(db).not.toBeNull();
    await db!.createCollection(targetCollection).catch(() => {});
    const collections = await db!.listCollections({ name: targetCollection }).toArray();
    expect(collections.length).toBe(1);
  });

  it('should writeBatch — insert events into target collection', async () => {
    const events: UnifiedChangeEvent[] = [
      createEvent({ op: 'I', table: targetCollection, after: { id: '1', name: 'Alice', value: 100 } }),
      createEvent({ op: 'I', table: targetCollection, after: { id: '2', name: 'Bob', value: 200 } }),
      createEvent({ op: 'I', table: targetCollection, after: { id: '3', name: 'Charlie', value: 300 } }),
    ];
    const result = await connector.writeBatch(targetCollection, events);
    expect(result.inserted).toBe(3);
    const db = connector.getDb();
    const docs = await db!.collection(targetCollection).find().toArray();
    expect(docs.length).toBe(3);
  });

  it('should writeBatch — handle updates', async () => {
    const updateEvent = createEvent({
      op: 'U', table: targetCollection,
      after: { id: '1', name: 'Alice Updated', value: 150 },
      before: { id: '1', name: 'Alice', value: 100 },
    });
    const result = await connector.writeBatch(targetCollection, [updateEvent]);
    expect(result.updated || result.inserted).toBeGreaterThanOrEqual(1);
    const db = connector.getDb();
    const doc = await db!.collection(targetCollection).findOne({ id: '1' });
    expect(doc?.name).toBe('Alice Updated');
  });

  it('should merge — upsert with key columns', async () => {
    const mergeEvents: UnifiedChangeEvent[] = [
      createEvent({ op: 'I', table: targetCollection, after: { id: '4', name: 'Diana', value: 400 } }),
      createEvent({ op: 'U', table: targetCollection, after: { id: '2', name: 'Bob Merged', value: 250 } }),
    ];
    const result = await connector.merge(targetCollection, mergeEvents, ['id']);
    expect(result.upserted + result.updated).toBeGreaterThanOrEqual(2);
    const db = connector.getDb();
    const docs = await db!.collection(targetCollection).find().sort({ id: 1 }).toArray();
    expect(docs.length).toBe(4);
  });

  it('should writeBatch — handle deletes', async () => {
    const deleteEvent = createEvent({
      op: 'D', table: targetCollection,
      before: { id: '3', name: 'Charlie', value: 300 },
    });
    const result = await connector.writeBatch(targetCollection, [deleteEvent]);
    expect(result.deleted || result.removed).toBeGreaterThanOrEqual(1);
    const db = connector.getDb();
    const docs = await db!.collection(targetCollection).find().toArray();
    expect(docs.length).toBe(3);
  });

  it('should handle empty batch', async () => {
    const result = await connector.writeBatch(targetCollection, []);
    expect(result.inserted).toBe(0);
  });
});
