// @ts-nocheck
// @vitest-environment node
// Integration test: PostgreSQL target writer — writeBatch, merge, createTableIfNeeded

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { skipIfNoDocker, getTestConfig, waitForService } from './docker-harness';
import { ConnectorRegistry } from '../../connectors/registry';
import { createEvent } from '../../events';
import '../../connectors/postgresql';
import type { UnifiedChangeEvent } from '../../events';

describe('PostgreSQL Target Writer Integration', () => {
  let connector: any;
  const targetTable = 'target_test_customers';
  const config = getTestConfig('postgres');

  beforeAll(async () => {
    skipIfNoDocker('postgres');
    await waitForService(config.host, config.port, 15000);

    // Try to get as target connector
    try {
      connector = ConnectorRegistry.getTarget('postgresql', 'test-pg-target', config);
    } catch {
      // Fall back to source connector (which also has writer methods)
      connector = ConnectorRegistry.getSource('postgresql', 'test-pg-target', config);
    }
    await connector.connect(config);
  });

  afterAll(async () => {
    if (connector?.isConnected()) {
      try {
        const client = connector.getClient?.() || connector;
        await client.query?.(`DROP TABLE IF EXISTS ${targetTable}`);
        await client.query?.('DROP TABLE IF EXISTS merge_test_table');
      } catch { /* best effort */ }
      await connector.disconnect();
    }
  });

  it('should connect successfully', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('should createTableIfNeeded', async () => {
    const schema = {
      id: { type: 'integer', primaryKey: true },
      name: { type: 'varchar(100)' },
      email: { type: 'varchar(200)' },
      balance: { type: 'decimal(10,2)' },
      created_at: { type: 'timestamp' },
    };
    await connector.createTableIfNeeded(targetTable, schema);

    // Verify table exists
    const tables = await connector.getTables();
    expect(tables).toContain(targetTable);
  });

  it('should writeBatch — insert events into target', async () => {
    const events: UnifiedChangeEvent[] = [
      createEvent('I', targetTable, { id: 1, name: 'Alice', email: 'alice@test.com', balance: 100.50 }, null, '1', { source: 'test' }),
      createEvent('I', targetTable, { id: 2, name: 'Bob', email: 'bob@test.com', balance: 200.75 }, null, '2', { source: 'test' }),
      createEvent('I', targetTable, { id: 3, name: 'Charlie', email: 'charlie@test.com', balance: 300.00 }, null, '3', { source: 'test' }),
    ];

    const written = await connector.writeBatch(targetTable, events);
    expect(written).toBe(3);

    // Verify data
    const extracted = await connector.extractFull(targetTable);
    expect(extracted.length).toBe(3);
    const names = extracted.map((e: UnifiedChangeEvent) => e.after?.name).sort();
    expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should writeBatch — handle updates', async () => {
    const events: UnifiedChangeEvent[] = [
      createEvent('U', targetTable, { id: 1, name: 'Alice Updated', email: 'alice2@test.com', balance: 150.00 }, { id: 1, name: 'Alice' }, '1', { source: 'test' }),
    ];

    const written = await connector.writeBatch(targetTable, events);
    expect(written).toBeGreaterThanOrEqual(1);
  });

  it('should merge — upsert with key columns', async () => {
    const mergeTable = 'merge_test_table';
    const schema = { id: { type: 'integer', primaryKey: true }, name: { type: 'varchar(100)' }, score: { type: 'integer' } };
    await connector.createTableIfNeeded(mergeTable, schema);

    // Initial insert
    const insertEvents: UnifiedChangeEvent[] = [
      createEvent('I', mergeTable, { id: 1, name: 'Player1', score: 100 }, null, '1', {}),
      createEvent('I', mergeTable, { id: 2, name: 'Player2', score: 200 }, null, '2', {}),
    ];
    await connector.writeBatch(mergeTable, insertEvents);

    // Merge with updated and new records
    const mergeEvents: UnifiedChangeEvent[] = [
      createEvent('U', mergeTable, { id: 1, name: 'Player1', score: 150 }, null, '1', {}),
      createEvent('I', mergeTable, { id: 3, name: 'Player3', score: 300 }, null, '3', {}),
    ];
    const merged = await connector.merge(mergeTable, mergeEvents, ['id']);
    expect(merged).toBeGreaterThanOrEqual(2);

    // Verify merge results
    const allEvents = await connector.extractFull(mergeTable);
    expect(allEvents.length).toBe(3);
    const p1 = allEvents.find((e: UnifiedChangeEvent) => e.after?.id === 1);
    expect(p1?.after?.score).toBe(150);
  });

  it('should writeBatch — handle deletes', async () => {
    const events: UnifiedChangeEvent[] = [
      createEvent('D', targetTable, null, { id: 3, name: 'Charlie' }, '3', { source: 'test' }),
    ];
    const written = await connector.writeBatch(targetTable, events);
    expect(written).toBeGreaterThanOrEqual(1);

    const remaining = await connector.extractFull(targetTable);
    const ids = remaining.map((e: UnifiedChangeEvent) => e.after?.id);
    expect(ids).not.toContain(3);
  });

  it('should handle empty batch', async () => {
    const written = await connector.writeBatch(targetTable, []);
    expect(written).toBe(0);
  });
});

