// @ts-nocheck
// MySQL Connector Unit Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('mysql2/promise', () => {
  const mockConn = {
    ping: vi.fn().mockResolvedValue(true),
    query: vi.fn().mockResolvedValue([[{ ok: 1 }]]),
    release: vi.fn(),
  };
  const mockPool = {
    getConnection: vi.fn().mockResolvedValue(mockConn),
    query: vi.fn((sql: string) => {
      if (sql.includes('SELECT 1 AS ok') || sql.includes('SELECT 1')) {
        return Promise.resolve([[{ ok: 1 }]]);
      }
      if (sql.includes('information_schema.tables')) {
        return Promise.resolve([[{ table_name: 'users' }]]);
      }
      return Promise.resolve([[{ '1': 1 }]]);
    }),
    end: vi.fn(),
  };
  const mod = { createPool: vi.fn(() => mockPool) };
  return { default: mod, ...mod };
});

import { MySQLConnector } from '../../connectors/mysql';

describe('MySQLConnector', () => {
  let connector: MySQLConnector;

  beforeEach(() => {
    connector = new MySQLConnector('mysql-1', 'test-mysql', 'mysql', {
      host: 'localhost', port: 3306, database: 'testdb', user: 'testuser', password: 'testpass',
    });
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      await connector.connect();
      expect(connector.isConnected()).toBe(true);
    });
  });

  describe('testConnection', () => {
    it('should return true on success', async () => {
      await connector.connect();
      const result = await connector.testConnection();
      expect(result).toBe(true);
    });
  });

  describe('getTables', () => {
    it('should return table names', async () => {
      await connector.connect();
      const tables = await connector.getTables();
      expect(tables).toEqual(['users']);
    });
  });
});
