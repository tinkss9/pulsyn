// @ts-nocheck
// MySQL Connector Unit Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('mysql2/promise', () => {
  const mockConn = { ping: vi.fn().mockResolvedValue(true), release: vi.fn() };
  const mockPool = {
    getConnection: vi.fn().mockResolvedValue(mockConn),
    query: vi.fn(),
    end: vi.fn(),
  };
  return { createPool: vi.fn(() => mockPool) };
});

import { MySQLConnector } from '../../connectors/mysql';

describe('MySQLConnector', () => {
  let connector: MySQLConnector;

  beforeEach(() => {
    connector = new MySQLConnector('mysql-1', 'test-mysql', {
      host: 'localhost', port: 3306, database: 'testdb', user: 'testuser', password: 'testpass',
    });
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      await connector.connect(connector.config);
      expect(connector.isConnected()).toBe(true);
    });
  });

  describe('testConnection', () => {
    it('should return true on success', async () => {
      await connector.connect(connector.config);
      const result = await connector.testConnection();
      expect(result).toBe(true);
    });
  });

  describe('getTables', () => {
    it('should return table names', async () => {
      await connector.connect(connector.config);
      const pool = (connector as any).pool;
      pool.query = vi.fn().mockResolvedValue([[{ table_name: 'users' }]]);
      const tables = await connector.getTables();
      expect(tables).toEqual(['users']);
    });
  });
});

