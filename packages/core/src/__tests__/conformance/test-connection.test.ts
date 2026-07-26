// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseConnector } from '../../connectors/base';
import { ConnectorRegistry } from '../../connectors/registry';
import { getTestConnector, TEST_CONFIG } from './conftest';

describe('Connection Conformance', () => {
  let connector: BaseConnector;

  beforeEach(() => {
    connector = getTestConnector();
  });

  afterEach(async () => {
    try {
      await connector.disconnect();
    } catch {
      // already disconnected
    }
  });

  it('should connect with valid credentials', async () => {
    const result = await connector.connect();
    expect(result).toBeDefined();
    expect(connector.isConnected()).toBe(true);
  });

  it('should disconnect cleanly without errors', async () => {
    await connector.connect();
    expect(connector.isConnected()).toBe(true);

    await connector.disconnect();
    expect(connector.isConnected()).toBe(false);
  });

  it('should throw on invalid credentials', async () => {
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
    const unreachableConnector = ConnectorRegistry.getSource('postgresql', 'unreach-id', {
      host: '192.0.2.1', // RFC 5737 TEST-NET, guaranteed unreachable
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
    const firstState = connector.isConnected();

    // Second connect should not throw or change state
    await connector.connect();
    const secondState = connector.isConnected();

    expect(firstState).toBe(true);
    expect(secondState).toBe(true);
  });
});

