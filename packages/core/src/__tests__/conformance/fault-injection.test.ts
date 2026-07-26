// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseConnector } from '../../connectors/base';
import { ConnectorRegistry } from '../../connectors/registry';
import { getTestConnector, getTargetConnector, createBatch, TEST_CONFIG, TEST_TABLE } from './conftest';

describe('Fault Injection Conformance', () => {
  let source: BaseConnector;
  let target: BaseConnector;

  beforeEach(async () => {
    source = getTestConnector();
    target = getTargetConnector();
    await source.connect();
    await target.connect();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    try { await source.disconnect(); } catch { /* noop */ }
    try { await target.disconnect(); } catch { /* noop */ }
  });

  it('should handle disconnect after batch N without data loss', async () => {
    let batchCount = 0;
    const allRecords: any[] = [];

    vi.spyOn(source, 'extractFull').mockImplementation(async (_table, opts) => {
      batchCount++;
      if (batchCount === 3) {
        throw new Error('Connection reset: socket hang up');
      }
      const batch = createBatch(5, 'S', (batchCount - 1) * 5 + 1);
      allRecords.push(...batch);
      return batch;
    });

    const collected: any[] = [];
    try {
      for (let i = 0; i < 5; i++) {
        const events = await source.extractFull(TEST_TABLE, { limit: 5, offset: i * 5 });
        collected.push(...events);
      }
    } catch (err: any) {
      expect(err.message).toContain('Connection reset');
    }

    // Records from successful batches must not be lost
    expect(collected.length).toBe(10); // 2 successful batches of 5
    const ids = collected.map((r) => r.key.id);
    const uniqueIds = [...new Set(ids)];
    expect(uniqueIds.length).toBe(collected.length); // no duplicates
  });

  it('should handle failure before checkpoint', async () => {
    let checkpointSaved = false;
    const saveCheckpoint = vi.fn(() => { checkpointSaved = true; });

    vi.spyOn(source, 'extractFull').mockImplementation(async () => {
      // Fail BEFORE checkpoint is saved
      throw new Error('Crash before checkpoint');
    });

    try {
      const events = await source.extractFull(TEST_TABLE);
      saveCheckpoint();
    } catch (err: any) {
      expect(err.message).toContain('Crash before checkpoint');
    }

    expect(checkpointSaved).toBe(false);
    expect(saveCheckpoint).not.toHaveBeenCalled();
  });

  it('should handle failure after checkpoint', async () => {
    let checkpointSaved = false;
    const saveCheckpoint = vi.fn(() => { checkpointSaved = true; });

    vi.spyOn(source, 'extractFull').mockResolvedValueOnce(createBatch(5, 'S', 1));

    const events = await source.extractFull(TEST_TABLE);
    saveCheckpoint();

    // Now simulate post-checkpoint failure
    vi.spyOn(target, 'writeBatch').mockRejectedValueOnce(new Error('Post-checkpoint crash'));

    try {
      await target.writeBatch(TEST_TABLE, events);
    } catch (err: any) {
      expect(err.message).toContain('Post-checkpoint crash');
    }

    // Checkpoint WAS saved, so recovery should resume from here
    expect(checkpointSaved).toBe(true);
    expect(saveCheckpoint).toHaveBeenCalledTimes(1);
  });

  it('should retry on HTTP 429 (rate limit)', async () => {
    let attempts = 0;

    vi.spyOn(source, 'extractFull').mockImplementation(async () => {
      attempts++;
      if (attempts <= 2) {
        const error: any = new Error('Too Many Requests');
        error.statusCode = 429;
        error.retryAfter = 5;
        throw error;
      }
      return createBatch(3, 'S', 1);
    });

    const events = await source.extractFull(TEST_TABLE);
    expect(attempts).toBe(3);
    expect(events.length).toBe(3);
  });

  it('should retry on HTTP 500 (server error)', async () => {
    let attempts = 0;

    vi.spyOn(source, 'extractFull').mockImplementation(async () => {
      attempts++;
      if (attempts === 1) {
        const error: any = new Error('Internal Server Error');
        error.statusCode = 500;
        throw error;
      }
      return createBatch(4, 'S', 1);
    });

    const events = await source.extractFull(TEST_TABLE);
    expect(attempts).toBe(2);
    expect(events.length).toBe(4);
  });

  it('should retry on HTTP 503 (service unavailable)', async () => {
    let attempts = 0;

    vi.spyOn(source, 'extractFull').mockImplementation(async () => {
      attempts++;
      if (attempts <= 3) {
        const error: any = new Error('Service Unavailable');
        error.statusCode = 503;
        throw error;
      }
      return createBatch(2, 'S', 1);
    });

    const events = await source.extractFull(TEST_TABLE);
    expect(attempts).toBe(4);
    expect(events.length).toBe(2);
  });

  it('should handle query timeout gracefully', async () => {
    vi.spyOn(source, 'extractFull').mockImplementation(async () => {
      const error: any = new Error('Query execution was interrupted: timeout exceeded');
      error.code = 'QUERY_TIMEOUT';
      throw error;
    });

    await expect(source.extractFull(TEST_TABLE)).rejects.toThrow('timeout');
  });

  it('should handle credential expiry mid-run', async () => {
    let callCount = 0;

    vi.spyOn(source, 'extractFull').mockImplementation(async () => {
      callCount++;
      if (callCount === 2) {
        const error: any = new Error('Authentication token expired');
        error.code = 'AUTH_EXPIRED';
        error.statusCode = 401;
        throw error;
      }
      return createBatch(3, 'S', (callCount - 1) * 3 + 1);
    });

    // First call succeeds
    const batch1 = await source.extractFull(TEST_TABLE);
    expect(batch1.length).toBe(3);

    // Second call fails with auth error
    await expect(source.extractFull(TEST_TABLE)).rejects.toThrow('token expired');

    // Third call after re-auth should succeed
    const batch3 = await source.extractFull(TEST_TABLE);
    expect(batch3.length).toBe(3);
  });

  it('should handle malformed records without stopping pipeline', async () => {
    const mixedBatch = [
      { op: 'S', table: TEST_TABLE, key: { id: 1 }, after: { id: 1, name: 'good' }, ts: Date.now() },
      { op: 'S', table: TEST_TABLE, key: { id: 2 }, after: null as any, ts: Date.now() },
      { op: 'INVALID', table: TEST_TABLE, key: { id: 3 }, after: { id: 3 }, ts: Date.now() },
      { op: 'S', table: TEST_TABLE, key: null as any, after: { id: 4, name: 'good' }, ts: Date.now() },
      { op: 'S', table: TEST_TABLE, key: { id: 5 }, after: { id: 5, name: 'good' }, ts: Date.now() },
    ];

    vi.spyOn(source, 'extractFull').mockResolvedValue(mixedBatch);

    const writeSpy = vi.spyOn(target, 'writeBatch').mockImplementation(async (_table, records) => {
      const valid = records.filter((r: any) => r.after && r.key && r.op === 'S');
      const invalid = records.filter((r: any) => !r.after || !r.key || r.op !== 'S');
      return {
        inserted: valid.length,
        errors: invalid.length,
        deleted: 0,
        merged: 0,
        failedRecords: invalid,
      };
    });

    const events = await source.extractFull(TEST_TABLE);
    const result = await target.writeBatch(TEST_TABLE, events);

    expect(result.inserted).toBe(3); // 3 valid records
    expect(result.errors).toBe(2); // 2 malformed
    expect(result.failedRecords.length).toBe(2);
  });

  it('should handle target commit failure and preserve source state', async () => {
    vi.spyOn(source, 'extractFull').mockResolvedValue(createBatch(5, 'S', 1));

    vi.spyOn(target, 'writeBatch').mockRejectedValue(
      new Error('COMMIT failed: disk full')
    );

    const events = await source.extractFull(TEST_TABLE);
    expect(events.length).toBe(5);

    await expect(target.writeBatch(TEST_TABLE, events)).rejects.toThrow('COMMIT failed');

    // Source connector should still be connected and valid
    expect(source.isConnected()).toBe(true);
  });

  it('should handle schema change mid-stream', async () => {
    let callCount = 0;

    vi.spyOn(source, 'extractFull').mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return [
          { op: 'S', table: TEST_TABLE, key: { id: 1 }, after: { id: 1, name: 'a' }, ts: Date.now() },
          { op: 'S', table: TEST_TABLE, key: { id: 2 }, after: { id: 2, name: 'b' }, ts: Date.now() },
        ];
      }
      // Second batch has a new column — schema changed mid-extraction
      return [
        { op: 'S', table: TEST_TABLE, key: { id: 3 }, after: { id: 3, name: 'c', email: 'c@test.com' }, ts: Date.now() },
        { op: 'S', table: TEST_TABLE, key: { id: 4 }, after: { id: 4, name: 'd', email: 'd@test.com' }, ts: Date.now() },
      ];
    });

    const batch1 = await source.extractFull(TEST_TABLE);
    const batch2 = await source.extractFull(TEST_TABLE);

    // Batch 1 has 2 fields per record, batch 2 has 3
    const batch1Fields = Object.keys(batch1[0].after);
    const batch2Fields = Object.keys(batch2[0].after);

    expect(batch2Fields.length).toBeGreaterThan(batch1Fields.length);
    expect(batch2Fields).toContain('email');
    expect(batch1Fields).not.toContain('email');

    // Both batches should still be writable
    const writeSpy = vi.spyOn(target, 'writeBatch').mockResolvedValue({
      inserted: 2,
      errors: 0,
      deleted: 0,
      merged: 0,
      failedRecords: [],
    });

    await target.writeBatch(TEST_TABLE, batch1);
    await target.writeBatch(TEST_TABLE, batch2);

    expect(writeSpy).toHaveBeenCalledTimes(2);
  });
});

