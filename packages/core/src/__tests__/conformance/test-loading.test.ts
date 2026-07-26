// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseConnector } from '../../connectors/base';
import { getTargetConnector, createBatch, TEST_TABLE } from './conftest';

describe('Loading Conformance', () => {
  let target: BaseConnector;

  beforeEach(async () => {
    target = getTargetConnector();
    await target.connect();
    // Reset dynamic table tracking
    const pg = await import('pg');
    (pg as any).__mockPool.__resetTables();
  });

  afterEach(async () => {
    await target.disconnect();
  });

  it('should insert records via writeBatch', async () => {
    const batch = createBatch(10, 'I');
    const result = await target.writeBatch(TEST_TABLE, batch);

    expect(result).toBeDefined();
    expect(result.inserted).toBe(10);
    expect(result.errors).toBe(0);
  });

  it('should upsert records via merge mode', async () => {
    const initial = createBatch(5, 'I', 1);
    await target.writeBatch(TEST_TABLE, initial);

    const upsertBatch = createBatch(5, 'U', 1);
    const result = await target.writeBatch(TEST_TABLE, upsertBatch, { mode: 'merge' });

    expect(result).toBeDefined();
    expect(result.merged).toBe(5);
    expect(result.errors).toBe(0);
  });

  it('should create table if it does not exist', async () => {
    const schema = {
      columns: {
        id: 'integer',
        value: 'varchar',
      },
    };

    const newTable = 'conformance_auto_create_table';
    const result = await target.createTableIfNeeded(newTable, schema);

    expect(result).toBeDefined();
    expect(result.created).toBe(true);

    const tables = await target.getTables();
    const found = tables.find((t: string) => t.includes(newTable));
    expect(found).toBeDefined();
  });

  it('should not error when creating an existing table', async () => {
    const schema = {
      columns: {
        id: 'integer',
      },
    };

    await target.createTableIfNeeded(TEST_TABLE, schema);
    const result = await target.createTableIfNeeded(TEST_TABLE, schema);
    expect(result.created).toBe(false);
  });

  it('should handle partial failures and report errors', async () => {
    const batch = createBatch(5, 'I', 100);
    batch[2] = { ...batch[2], after: null as any };

    const result = await target.writeBatch(TEST_TABLE, batch);

    expect(result.inserted).toBeLessThan(5);
    expect(result.errors).toBeGreaterThan(0);
    expect(result.failedRecords).toBeDefined();
    expect(result.failedRecords.length).toBeGreaterThan(0);
  });

  it('should handle delete operations in batch', async () => {
    const inserts = createBatch(3, 'I', 200);
    await target.writeBatch(TEST_TABLE, inserts);

    const deletes = createBatch(3, 'D', 200);
    const result = await target.writeBatch(TEST_TABLE, deletes);

    expect(result).toBeDefined();
    expect(result.deleted).toBe(3);
  });
});
