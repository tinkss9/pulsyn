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
  let mockPool: any;

  beforeEach(() => {
    connector = new MySQLConnector('mysql-1', 'test-mysql', {
      host: 'localhost',
      port: 3306,
      database: 'testdb',
      user: 'testuser',
      password: 'testpass',
    });
    mockPool = (connector as any).pool;
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      const mockConn = { ping: vi.fn().mockResolvedValue(true), release: vi.fn() };
      mockPool.getConnection.mockResolvedValue(mockConn);

      await connector.connect(connector.config);

      expect(mockPool.getConnection).toHaveBeenCalled();
      expect(mockConn.ping).toHaveBeenCalled();
      expect(connector.isConnected()).toBe(true);
    });
  });

  describe('testConnection', () => {
    it('should return true on success', async () => {
      const mockConn = { ping: vi.fn().mockResolvedValue(true), release: vi.fn() };
      mockPool.getConnection.mockResolvedValue(mockConn);

      const result = await connector.testConnection();
      expect(result).toBe(true);
    });
  });

  describe('getTables', () => {
    it('should return table names', async () => {
      mockPool.query.mockResolvedValue([[{ table_name: 'users' }, { table_name: 'orders' }]]);

      const tables = await connector.getTables();
      expect(tables).toEqual(['users', 'orders']);
    });
  });
});
