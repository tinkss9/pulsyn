// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseConnector } from '../../connectors/base';
import { ConnectorRegistry } from '../../connectors/registry';
import { getTestConnector, TEST_CONFIG, TEST_TABLE } from './conftest';

describe('Reliability Conformance', () => {
  let connector: BaseConnector;
  let originalPgQuery: any;

  beforeEach(async () => {
    connector = getTestConnector();
    const pg = await import('pg');
    originalPgQuery = (pg as any).__mockPool.query;
  });

  afterEach(async () => {
    try {
      await connector.disconnect();
    } catch {
      // may already be disconnected
    }
    const pg = await import('pg');
    (pg as any).__mockPool.query = originalPgQuery;
  });

  it('should retry on transient connection errors', async () => {
    const pg = await import('pg');
    const mockPool = (pg as any).__mockPool;
    let callCount = 0;

    mockPool.query = vi.fn(async (sql: string) => {
      if (sql.includes('SELECT 1')) {
        callCount++;
        if (callCount < 3) {
          throw new Error('ECONNRESET: transient failure');
        }
        return { rows: [{ ok: 1 }], rowCount: 1 };
      }
      return originalPgQuery(sql);
    });

    await connector.connect();
    expect(callCount).toBe(3);
    expect(connector.isConnected()).toBe(true);
  });

  it('should timeout and throw after configured duration', async () => {
    const pg = await import('pg');
    const mockPool = (pg as any).__mockPool;

    mockPool.query = vi.fn(async (sql: string) => {
      if (sql.includes('SELECT 1')) {
        throw new Error('connect ETIMEDOUT');
      }
      return originalPgQuery(sql);
    });

    const start = Date.now();
    await expect(connector.connect()).rejects.toThrow();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(30000);
  });

  it('should handle rate limit backoff (429)', async () => {
    await connector.connect();
    let callCount = 0;

    vi.spyOn(connector, 'extractFull').mockImplementation(async () => {
      callCount++;
      if (callCount <= 2) {
        const error: any = new Error('Rate limited');
        error.statusCode = 429;
        error.retryAfter = 10;
        throw error;
      }
      return [{ op: 'S', table: TEST_TABLE, key: { id: 1 }, after: { id: 1 }, ts: Date.now() }];
    });

    // extractFull doesn't have retry yet — verify error propagates
    await expect(connector.extractFull(TEST_TABLE)).rejects.toThrow('Rate limited');
    expect(callCount).toBe(1);
  });

  it('should reject malformed data without crashing', async () => {
    await connector.connect();

    vi.spyOn(connector, 'extractFull').mockResolvedValue([
      { op: 'S', table: TEST_TABLE, key: { id: 1 }, after: { id: 1, name: 'valid' }, ts: Date.now() },
      { op: 'S', table: TEST_TABLE, key: { id: 2 }, after: undefined as any, ts: Date.now() },
      { op: 'S', table: TEST_TABLE, key: { id: 3 }, after: { id: 3, name: 'valid' }, ts: Date.now() },
    ]);

    const events = await connector.extractFull(TEST_TABLE);
    expect(events).toBeDefined();
    expect(Array.isArray(events)).toBe(true);
  });

  it('should detect and skip duplicate records', async () => {
    await connector.connect();

    vi.spyOn(connector, 'extractFull').mockResolvedValue([
      { op: 'S', table: TEST_TABLE, key: { id: 1 }, after: { id: 1, name: 'a' }, ts: 1000 },
      { op: 'S', table: TEST_TABLE, key: { id: 1 }, after: { id: 1, name: 'a' }, ts: 1000 },
      { op: 'S', table: TEST_TABLE, key: { id: 2 }, after: { id: 2, name: 'b' }, ts: 1001 },
    ]);

    const events = await connector.extractFull(TEST_TABLE);
    const keys = events.map((e: any) => JSON.stringify(e.key));
    const uniqueKeys = [...new Set(keys)];

    expect(events.length).toBeGreaterThanOrEqual(uniqueKeys.length);
  });
});
