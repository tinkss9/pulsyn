// Connector E2E Tests — tests against real database connections
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// These tests require running databases (use docker-compose.test.yml)
// Run: docker-compose -f docker/docker-compose.test.yml up -d

const TEST_PG_CONFIG = {
  host: 'localhost',
  port: 5433,
  database: 'pulsyn_test',
  user: 'pulsyn',
  password: 'test123',
};

const TEST_MYSQL_CONFIG = {
  host: 'localhost',
  port: 3307,
  database: 'pulsyn_test',
  user: 'root',
  password: 'test123',
};

// Skip if no test database available
const hasTestDb = process.env.TEST_DATABASE_URL || process.env.CI;

describe.skipIf(!hasTestDb)('PostgreSQL Connector E2E', () => {
  let connector: any;

  beforeAll(async () => {
    const { PostgreSQLConnector } = await import('../../connectors/postgresql');
    connector = new PostgreSQLConnector('pg-test', 'test-pg', TEST_PG_CONFIG);
    await connector.connect(TEST_PG_CONFIG);
  });

  afterAll(async () => {
    if (connector) await connector.disconnect();
  });

  it('should connect to PostgreSQL', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('should list tables', async () => {
    const tables = await connector.getTables();
    expect(Array.isArray(tables)).toBe(true);
  });

  it('should get table schema', async () => {
    const tables = await connector.getTables();
    if (tables.length > 0) {
      const schema = await connector.getTableSchema(tables[0]);
      expect(schema.name).toBe(tables[0]);
      expect(Array.isArray(schema.columns)).toBe(true);
    }
  });

  it('should extract full data', async () => {
    const tables = await connector.getTables();
    if (tables.length > 0) {
      const events = await connector.extractFull(tables[0]);
      expect(Array.isArray(events)).toBe(true);
    }
  });

  it('should test connection', async () => {
    const result = await connector.testConnection();
    expect(result).toBe(true);
  });
});

describe.skipIf(!hasTestDb)('MySQL Connector E2E', () => {
  let connector: any;

  beforeAll(async () => {
    const { MySQLConnector } = await import('../../connectors/mysql');
    connector = new MySQLConnector('mysql-test', 'test-mysql', TEST_MYSQL_CONFIG);
    await connector.connect(TEST_MYSQL_CONFIG);
  });

  afterAll(async () => {
    if (connector) await connector.disconnect();
  });

  it('should connect to MySQL', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('should list tables', async () => {
    const tables = await connector.getTables();
    expect(Array.isArray(tables)).toBe(true);
  });

  it('should get table schema', async () => {
    const tables = await connector.getTables();
    if (tables.length > 0) {
      const schema = await connector.getTableSchema(tables[0]);
      expect(schema.name).toBe(tables[0]);
      expect(Array.isArray(schema.columns)).toBe(true);
    }
  });

  it('should test connection', async () => {
    const result = await connector.testConnection();
    expect(result).toBe(true);
  });
});

describe('Connector Registry E2E', () => {
  it('should list all registered connectors', async () => {
    const { ConnectorRegistry } = await import('../../connectors/registry');
    const all = ConnectorRegistry.listAll();
    expect(all.sources.length).toBeGreaterThan(10);
    expect(all.targets.length).toBeGreaterThan(0);
  });

  it('should create PostgreSQL connector from registry', async () => {
    const { ConnectorRegistry } = await import('../../connectors/registry');
    const connector = ConnectorRegistry.getSource('postgresql', 'test-pg', TEST_PG_CONFIG);
    expect(connector).toBeDefined();
    expect(connector.engine).toBe('postgresql');
  });
});
