// PostgreSQL Connector Unit Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock pg module
vi.mock('pg', () => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn(),
    end: vi.fn(),
  };
  return { Pool: vi.fn(() => mockPool) };
});

import { PostgreSQLConnector } from '../../connectors/postgresql';

describe('PostgreSQLConnector', () => {
  let connector: PostgreSQLConnector;
  let mockPool: any;

  beforeEach(() => {
    connector = new PostgreSQLConnector('pg-1', 'test-pg', {
      host: 'localhost',
      port: 5432,
      database: 'testdb',
      user: 'testuser',
      password: 'testpass',
    });
    mockPool = (connector as any).pool;
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      const mockClient = { query: vi.fn().mockResolvedValue({}), release: vi.fn() };
      mockPool.connect.mockResolvedValue(mockClient);

      await connector.connect(connector.config);

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('SELECT 1');
      expect(mockClient.release).toHaveBeenCalled();
      expect(connector.isConnected()).toBe(true);
    });

    it('should throw on connection failure', async () => {
      mockPool.connect.mockRejectedValue(new Error('Connection refused'));

      await expect(connector.connect(connector.config)).rejects.toThrow('Connection refused');
    });
  });

  describe('testConnection', () => {
    it('should return true on success', async () => {
      const mockClient = { query: vi.fn().mockResolvedValue({}), release: vi.fn() };
      mockPool.connect.mockResolvedValue(mockClient);

      const result = await connector.testConnection();
      expect(result).toBe(true);
    });

    it('should return false on failure', async () => {
      mockPool.connect.mockRejectedValue(new Error('Connection failed'));

      const result = await connector.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('getTables', () => {
    it('should return table names', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ table_name: 'users' }, { table_name: 'orders' }],
      });

      const tables = await connector.getTables();
      expect(tables).toEqual(['users', 'orders']);
    });

    it('should throw if not connected', async () => {
      (connector as any).pool = null;
      await expect(connector.getTables()).rejects.toThrow('Not connected');
    });
  });

  describe('disconnect', () => {
    it('should end pool and reset state', async () => {
      await connector.disconnect();
      expect(mockPool.end).toHaveBeenCalled();
      expect(connector.isConnected()).toBe(false);
    });
  });
});
