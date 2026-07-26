// @ts-nocheck
/**
 * Shared test utilities and fixtures for conformance tests.
 */
import { BaseConnector } from '../../connectors/base';
import { ConnectorRegistry } from '../../connectors/registry';

export const TEST_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'testdb',
  user: 'testuser',
  password: 'testpass',
};

export const TEST_TABLE = 'conformance_test_table';

export const TEST_SCHEMA = {
  columns: [
    { name: 'id', type: 'integer', primaryKey: true, nullable: false },
    { name: 'name', type: 'varchar', primaryKey: false, nullable: true },
    { name: 'created_at', type: 'timestamp', primaryKey: false, nullable: true },
  ],
};

export function getTestConnector(name: string = 'postgresql'): BaseConnector {
  return ConnectorRegistry.getSource(name, 'test-id', {
    host: TEST_CONFIG.host,
    port: TEST_CONFIG.port,
    database: TEST_CONFIG.database,
    user: TEST_CONFIG.user,
    password: TEST_CONFIG.password,
  });
}

export function getTargetConnector(name: string = 'postgresql'): BaseConnector {
  return ConnectorRegistry.getTarget(name, 'target-test-id', {
    host: TEST_CONFIG.host,
    port: TEST_CONFIG.port,
    database: 'target_testdb',
    user: TEST_CONFIG.user,
    password: TEST_CONFIG.password,
  });
}

export function skipIfNoCapability(connector: any, capability: string): void {
  if (!connector[capability]) {
    throw new Error(`SKIP: ${capability} not supported`);
  }
}

export function createMockEvent(op: string = 'I', key: number = 1) {
  return {
    op,
    table: TEST_TABLE,
    key: { id: key },
    after: { id: key, name: `record_${key}`, created_at: new Date().toISOString() },
    ts: Date.now(),
  };
}

export function createBatch(size: number, op: string = 'I', startKey: number = 1) {
  return Array.from({ length: size }, (_, i) => createMockEvent(op, startKey + i));
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

