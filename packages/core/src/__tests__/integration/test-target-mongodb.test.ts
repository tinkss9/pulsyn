// @ts-nocheck
// @vitest-environment node
// Integration test: MongoDB target writer — writeBatch, merge

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { skipIfNoDocker, getTestConfig, waitForService } from './docker-harness';
import { ConnectorRegistry } from '../../connectors/registry';
import { createEvent } from '../../events';
import type { UnifiedChangeEvent } from '../../events';

describe('MongoDB Target Writer Integration', () => {
  let connector: any;
  const targetCollection = 'target_test_events';
  const config = getTestConfig('mongodb');

  beforeAll(async () => {
    skipIfNoDocker('mongodb');
    await waitForService(config.host, config.port, 15000);

    try { await import('../../connectors/mongodb'); } catch { /* may not exist yet */ }

    try {
      connector = ConnectorRegistry.getTarget('mongodb', 'test-mongo-target', config);
    } catch {
      try {
        connector = ConnectorRegistry.getSource('mongodb', 'test-mongo-target', config);
      } catch {
        throw new Error('SKIP: MongoDB connector not registered');
      }
    }
    await connector.connect(config);
  });

  afterAll(async () => {
    if (connector?.isConnected()) {
      try {
        const db = connector.getDb?.();
        await db?.collection(targetCollection).drop();
        await db?.collection('merge_test_collection').drop();
      } catch { /* best effort */ }
      await connector.disconnect();
    }
  });

  it('should connect successfully', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('should writeBatch — insert events into target collection', async () => {
    const events: UnifiedChangeEvent[] = [
      createEvent('I', targetCollection, { _id: 'evt-1', type: 'purchase', amount: 50.00, customer: 'Alice' }, null, 'evt-1', {}),
      createEvent('I', targetCollection, { _id: 'evt-2', type: 'refund', amount: 15.00, customer: 'Bob' }, null, 'evt-2', {}),
      createEvent('I', targetCollection, { _id: 'evt-3', type: 'purchase', amount: 120.00, customer: 'Charlie' }, null, 'evt-3', {}),
    ];

    const written = await connector.writeBatch(targetCollection, events);
    expect(written).toBe(3);

    // Verify data
    const extracted = await connector.extractFull(targetCollection);
    expect(extracted.length).toBe(3);
    const customers = extracted.map((e: UnifiedChangeEvent) => e.after?.customer).sort();
    expect(customers).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should writeBatch — handle updates', async () => {
    const events: UnifiedChangeEvent[] = [
      createEvent('U', targetCollection, { _id: 'evt-1', type: 'purchase', amount: 75.00, customer: 'Alice Updated' }, { _id: 'evt-1' }, 'evt-1', {}),
    ];

    const written = await connector.writeBatch(targetCollection, events);
    expect(written).toBeGreaterThanOrEqual(1);

    const extracted = await connector.extractFull(targetCollection);
    const alice = extracted.find((e: UnifiedChangeEvent) => e.after?._id === 'evt-1');
    expect(alice?.after?.customer).toBe('Alice Updated');
    expect(alice?.after?.amount).toBe(75.00);
  });

  it('should merge — upsert with key columns', async () => {
    const mergeCollection = 'merge_test_collection';

    // Initial insert
    const insertEvents: UnifiedChangeEvent[] = [
      createEvent('I', mergeCollection, { _id: 'item-1', name: 'Laptop', stock: 10 }, null, 'item-1', {}),
      createEvent('I', mergeCollection, { _id: 'item-2', name: 'Phone', stock: 25 }, null, 'item-2', {}),
    ];
    await connector.writeBatch(mergeCollection, insertEvents);

    // Merge: update existing + insert new
    const mergeEvents: UnifiedChangeEvent[] = [
      createEvent('U', mergeCollection, { _id: 'item-1', name: 'Laptop Pro', stock: 5 }, null, 'item-1', {}),
      createEvent('I', mergeCollection, { _id: 'item-3', name: 'Tablet', stock: 15 }, null, 'item-3', {}),
    ];
    const merged = await connector.merge(mergeCollection, mergeEvents, ['_id']);
    expect(merged).toBeGreaterThanOrEqual(2);

    // Verify
    const allEvents = await connector.extractFull(mergeCollection);
    expect(allEvents.length).toBe(3);
    const laptop = allEvents.find((e: UnifiedChangeEvent) => e.after?._id === 'item-1');
    expect(laptop?.after?.name).toBe('Laptop Pro');
    expect(laptop?.after?.stock).toBe(5);
  });

  it('should writeBatch — handle deletes', async () => {
    const events: UnifiedChangeEvent[] = [
      createEvent('D', targetCollection, null, { _id: 'evt-3' }, 'evt-3', {}),
    ];
    const written = await connector.writeBatch(targetCollection, events);
    expect(written).toBeGreaterThanOrEqual(1);

    const remaining = await connector.extractFull(targetCollection);
    const ids = remaining.map((e: UnifiedChangeEvent) => e.after?._id);
    expect(ids).not.toContain('evt-3');
  });

  it('should handle empty batch', async () => {
    const written = await connector.writeBatch(targetCollection, []);
    expect(written).toBe(0);
  });
});

