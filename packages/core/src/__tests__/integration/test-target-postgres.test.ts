// @ts-nocheck
// @vitest-environment node
// Integration test: PostgreSQL target writer — writeBatch, merge, createTableIfNeeded

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { skipIfNoDocker, getTestConfig, waitForService } from './docker-harness';
import { ConnectorRegistry } from '../../connectors/registry';
import { createEvent } from '../../events';
import '../../connectors/postgresql';
import '../../connectors/postgresql-target';
import type { UnifiedChangeEvent } from '../../events';

describe('PostgreSQL Target Writer Integration', () => {
  let connector: any;
  const targetTable = 'target_test_customers';
  const config = getTestConfig('postgres');

  beforeAll(async () => {
    skipIfNoDocker('postgres');
    await waitForService(config.host, config.port, 15000);

    // Get target connector
    connector = ConnectorRegistry.getTarget('postgresql', 'test-pg-target', config);
    await connector.connect(config);
  });

  afterAll(async () => {
    if (connector?.isConnected()) {
      try {
        await connector.query?.(`DROP TABLE IF EXISTS ${targetTable}`);
        await connector.query?.('DROP TABLE IF EXISTS merge_test_table');
      } catch { /* best effort */ }
      await connector.disconnect();
    }
  });

  it('should connect successfully', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('should createTableIfNeeded', async () => {
    const result = await connector.createTableIfNeeded(targetTable, {
      columns: {
        id: 'integer',
        name: 'varchar',
        email: 'varchar',
      },
    });
    expect(result).toBeDefined();
    expect(result.created).toBe(true);
  });

  it('should writeBatch — insert events into target', async () => {
    const events = [
      createEvent({ op: 'I', table: targetTable, after: { id: 1, name: 'Alice', email: 'alice@test.com' } }),
      createEvent({ op: 'I', table: targetTable, after: { id: 2, name: 'Bob', email: 'bob@test.com' } }),
      createEvent({ op: 'I', table: targetTable, after: { id: 3, name: 'Charlie', email: 'charlie@test.com' } }),
    ];
    const result = await connector.writeBatch(targetTable, events);
    expect(result).toBeDefined();
    expect(result.inserted).toBe(3);
    expect(result.errors).toBe(0);
  });

  it('should writeBatch — handle updates', async () => {
    const events = [
      createEvent({ op: 'U', table: targetTable, after: { id: 1, name: 'Alice Updated', email: 'alice2@test.com' } }),
    ];
    const result = await connector.writeBatch(targetTable, events);
    expect(result).toBeDefined();
  });

  it('should merge — upsert with key columns', async () => {
    const events = [
      createEvent({ op: 'I', table: targetTable, after: { id: 1, name: 'Alice Merged', email: 'alice3@test.com' } }),
      createEvent({ op: 'I', table: targetTable, after: { id: 4, name: 'Dave', email: 'dave@test.com' } }),
    ];
    const merged = await connector.merge(targetTable, events, ['id']);
    expect(merged).toBeGreaterThanOrEqual(2);
  });

  it('should writeBatch — handle deletes', async () => {
    const events = [
      createEvent({ op: 'D', table: targetTable, after: null, before: { id: 2 } }),
    ];
    const result = await connector.writeBatch(targetTable, events);
    expect(result).toBeDefined();
    expect(result.deleted).toBe(1);
  });

  it('should handle empty batch', async () => {
    const result = await connector.writeBatch(targetTable, []);
    expect(result).toBeDefined();
    expect(result.inserted).toBe(0);
  });
});
