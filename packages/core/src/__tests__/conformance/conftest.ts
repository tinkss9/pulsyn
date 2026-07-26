// @ts-nocheck
/**
 * Shared test utilities and fixtures for conformance tests.
 */
import { vi } from 'vitest';
import { BaseConnector } from '../../connectors/base';
import { ConnectorRegistry } from '../../connectors/registry';

// Mock database drivers so conformance tests don't need real connections
vi.mock('pg', () => {
  let failRemaining = 0;
  const createdTables = new Set<string>();

  const mockClient = {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    release: vi.fn(),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn((sql: string, params?: any[]) => {
      if (failRemaining > 0) {
        failRemaining--;
        return Promise.reject(new Error('ECONNRESET: transient failure'));
      }

      // Track CREATE TABLE calls
      if (sql.includes('CREATE TABLE')) {
        const match = sql.match(/CREATE TABLE (?:IF NOT EXISTS )?(\S+)/i);
        if (match) createdTables.add(match[1].replace(/"/g, ''));
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      if (sql.includes('CREATE SCHEMA')) {
        return Promise.resolve({ rows: [], rowCount: 0 });
      }

      if (sql.includes('information_schema.tables')) {
        const baseRows = [{ full_name: 'public.conformance_test_table' }];
        for (const t of createdTables) {
          baseRows.push({ full_name: t.includes('.') ? t : `public.${t}` });
        }
        return Promise.resolve({ rows: baseRows, rowCount: baseRows.length });
      }
      if (sql.includes('information_schema.columns')) {
        return Promise.resolve({
          rows: [
            { column_name: 'id', data_type: 'integer', is_nullable: 'NO', column_default: null },
            { column_name: 'name', data_type: 'character varying', is_nullable: 'YES', column_default: null },
            { column_name: 'created_at', data_type: 'timestamp without time zone', is_nullable: 'YES', column_default: null },
          ],
          rowCount: 3,
        });
      }
      if (sql.includes('pg_index')) {
        return Promise.resolve({ rows: [{ attname: 'id' }], rowCount: 1 });
      }
      if (sql.includes('SELECT 1')) {
        return Promise.resolve({ rows: [{ ok: 1 }], rowCount: 1 });
      }
      if (sql.includes('SELECT *')) {
        const rows = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1, name: `record_${i + 1}`, created_at: new Date().toISOString(),
        }));
        return Promise.resolve({ rows, rowCount: 5 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }),
    end: vi.fn(),
    __setFailRemaining: (n: number) => { failRemaining = n; },
    __resetFailures: () => { failRemaining = 0; },
    __createdTables: createdTables,
    __resetTables: () => { createdTables.clear(); },
  };
  return { Pool: vi.fn(() => mockPool), Client: vi.fn(() => mockClient), __mockPool: mockPool };
});

vi.mock('mysql2/promise', () => {
  const mockConn = {
    ping: vi.fn().mockResolvedValue(true),
    query: vi.fn().mockResolvedValue([[{ '1': 1 }], []]),
    release: vi.fn(),
  };
  const mockPool = {
    getConnection: vi.fn().mockResolvedValue(mockConn),
    query: vi.fn((sql: string) => {
      if (sql.includes('information_schema.tables')) {
        return Promise.resolve([[{ table_name: 'conformance_test_table' }]]);
      }
      if (sql.includes('information_schema.columns')) {
        return Promise.resolve([[
          { column_name: 'id', data_type: 'int', is_nullable: 'NO', column_default: null },
          { column_name: 'name', data_type: 'varchar', is_nullable: 'YES', column_default: null },
          { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES', column_default: null },
        ]]);
      }
      if (sql.includes('SHOW INDEX') || sql.includes('PRIMARY')) {
        return Promise.resolve([[{ Column_name: 'id', Key_name: 'PRIMARY' }]]);
      }
      if (sql.includes('SELECT 1')) {
        return Promise.resolve([[{ '1': 1 }]]);
      }
      return Promise.resolve([[]]);
    }),
    end: vi.fn(),
  };
  const mod = { createPool: vi.fn(() => mockPool) };
  return { default: mod, ...mod, __mockPool: mockPool };
});

// Import connector modules so @registerSource/@registerTarget decorators run
import '../../connectors/postgresql';
import '../../connectors/postgresql-target';
import '../../connectors/mysql';

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
