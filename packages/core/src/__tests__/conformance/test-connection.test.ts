// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseConnector } from '../../connectors/base';
import { ConnectorRegistry } from '../../connectors/registry';
import { getTestConnector, TEST_CONFIG } from './conftest';

describe('Connection Conformance', () => {
  let connector: BaseConnector;
  let originalPgQuery: any;

  beforeEach(async () => {
    connector = getTestConnector();
    // Save the original mock query
    const pg = await import('pg');
    const mockPool = (pg as any).__mockPool;
    originalPgQuery = mockPool.query;
  });

  afterEach(async () => {
    try {
      await connector.disconnect();
    } catch {
      // already disconnected
    }
    // Restore original mock
    const pg = await import('pg');
    const mockPool = (pg as any).__mockPool;
    mockPool.query = originalPgQuery;
  });

  it('should connect with valid credentials', async () => {
    await connector.connect();
    expect(connector.isConnected()).toBe(true);
  });

  it('should disconnect cleanly without errors', async () => {
    await connector.connect();
    expect(connector.isConnected()).toBe(true);

    await connector.disconnect();
    expect(connector.isConnected()).toBe(false);
  });

  it('should throw on invalid credentials', async () => {
    const pg = await import('pg');
    const mockPool = (pg as any).__mockPool;

    mockPool.query = vi.fn(async (sql: string) => {
      if (sql.includes('SELECT 1')) {
        throw new Error('password authentication failed for user "invalid_user"');
      }
      return originalPgQuery(sql);
    });

    const badConnector = ConnectorRegistry.getSource('postgresql', 'bad-id', {
      host: TEST_CONFIG.host,
      port: TEST_CONFIG.port,
      database: TEST_CONFIG.database,
      user: 'invalid_user',
      password: 'wrong_password',
    });

    await expect(badConnector.connect()).rejects.toThrow();
    expect(badConnector.isConnected()).toBe(false);
  });

  it('should throw on unreachable host', async () => {
    const pg = await import('pg');
    const mockPool = (pg as any).__mockPool;

    mockPool.query = vi.fn(async (sql: string) => {
      if (sql.includes('SELECT 1')) {
        throw new Error('connect ETIMEDOUT 192.0.2.1:5432');
      }
      return originalPgQuery(sql);
    });

    const unreachableConnector = ConnectorRegistry.getSource('postgresql', 'unreach-id', {
      host: '192.0.2.1',
      port: 5432,
      database: 'testdb',
      user: 'testuser',
      password: 'testpass',
    });

    await expect(unreachableConnector.connect()).rejects.toThrow();
    expect(unreachableConnector.isConnected()).toBe(false);
  });

  it('should reconnect after disconnect', async () => {
    await connector.connect();
    expect(connector.isConnected()).toBe(true);

    await connector.disconnect();
    expect(connector.isConnected()).toBe(false);

    await connector.connect();
    expect(connector.isConnected()).toBe(true);
  });

  it('should handle idempotent connect calls', async () => {
    await connector.connect();
    expect(connector.isConnected()).toBe(true);

    await connector.connect();
    expect(connector.isConnected()).toBe(true);
  });
});
