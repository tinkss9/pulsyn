// @ts-nocheck
// PostgreSQL Connector Unit Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock pg module with query-aware mock
vi.mock('pg', () => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn((sql: string) => {
      if (sql.includes('SELECT 1 AS ok')) {
        return Promise.resolve({ rows: [{ ok: 1 }], rowCount: 1 });
      }
      if (sql.includes('SELECT 1')) {
        return Promise.resolve({ rows: [{ '1': 1 }], rowCount: 1 });
      }
      if (sql.includes('information_schema.tables')) {
        return Promise.resolve({ rows: [{ full_name: 'public.users' }], rowCount: 1 });
      }
      if (sql.includes('information_schema.columns')) {
        return Promise.resolve({
          rows: [
            { column_name: 'id', data_type: 'integer', is_nullable: 'NO', column_default: null },
            { column_name: 'name', data_type: 'varchar', is_nullable: 'YES', column_default: null },
          ],
          rowCount: 2,
        });
      }
      if (sql.includes('pg_index')) {
        return Promise.resolve({ rows: [{ attname: 'id' }], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }),
    end: vi.fn(),
  };
  return { Pool: vi.fn(() => mockPool), Client: vi.fn(() => mockClient) };
});

import { PostgreSQLConnector } from '../../connectors/postgresql';

describe('PostgreSQLConnector', () => {
  let connector: PostgreSQLConnector;

  beforeEach(() => {
    connector = new PostgreSQLConnector('pg-1', 'test-pg', 'postgresql', {
      host: 'localhost',
      port: 5432,
      database: 'testdb',
      user: 'testuser',
      password: 'testpass',
    });
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      await connector.connect();
      expect(connector.isConnected()).toBe(true);
    });

    it('should throw on connection failure', async () => {
      const { Pool } = await import('pg');
      const poolInstance = (Pool as any).mock.results[0]?.value;
      poolInstance.query.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(connector.connect()).rejects.toThrow('Connection refused');
    });
  });

  describe('testConnection', () => {
    it('should return true on success', async () => {
      await connector.connect();
      const result = await connector.testConnection();
      expect(result).toBe(true);
    });

    it('should return false when not connected', async () => {
      const result = await connector.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('getTables', () => {
    it('should return table names', async () => {
      await connector.connect();
      const tables = await connector.getTables();
      expect(tables).toEqual(['public.users']);
    });
  });

  describe('disconnect', () => {
    it('should end pool and reset state', async () => {
      await connector.connect();
      await connector.disconnect();
      expect(connector.isConnected()).toBe(false);
    });
  });
});
