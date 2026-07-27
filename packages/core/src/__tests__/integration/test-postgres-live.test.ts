// @ts-nocheck
// @vitest-environment node
// Integration test: PostgreSQL connector against Docker PG (localhost:5432)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { skipIfNoDocker, getTestConfig, waitForService } from './docker-harness';
import { ConnectorRegistry } from '../../connectors/registry';
import '../../connectors/postgresql';
import type { UnifiedChangeEvent } from '../../events';

describe('PostgreSQL Live Integration', () => {
  let connector: any;
  const testTable = 'integration_test_users';
  const config = getTestConfig('postgres');

  beforeAll(async () => {
    skipIfNoDocker('postgres');
    await waitForService(config.host, config.port, 15000);
    connector = ConnectorRegistry.getSource('postgresql', 'test-pg', config);
    await connector.connect(config);
  });

  afterAll(async () => {
    if (connector?.isConnected()) {
      try {
        await connector.query(`DROP TABLE IF EXISTS ${testTable}`);
        await connector.query('DROP TABLE IF EXISTS empty_test_table');
      } catch { /* best effort */ }
      await connector.disconnect();
    }
  });

  it('should connect successfully', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('should test connection', async () => {
    const ok = await connector.testConnection();
    expect(ok).toBe(true);
  });

  it('should list tables', async () => {
    const tables = await connector.getTables();
    expect(Array.isArray(tables)).toBe(true);
  });

  it('should create test table and insert rows', async () => {
    await connector.query(`
      CREATE TABLE IF NOT EXISTS ${testTable} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(200),
        amount DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await connector.query(`
      INSERT INTO ${testTable} (name, email, amount) VALUES
      ('Alice', 'alice@test.com', 100.50),
      ('Bob', 'bob@test.com', 200.75),
      ('Charlie', 'charlie@test.com', 300.00)
    `);

    const result = await connector.query(`SELECT COUNT(*) as cnt FROM ${testTable}`);
    expect(parseInt(result.rows[0].cnt)).toBeGreaterThanOrEqual(3);
  });

  it('should extractFull and get all rows as events', async () => {
    const events: UnifiedChangeEvent[] = await connector.extractFull(testTable);
    expect(events.length).toBeGreaterThanOrEqual(3);
    expect(events[0].op).toBe('S');
    expect(events[0].table).toBe(testTable);
    expect(events[0].after).toBeDefined();
    expect(events[0].after?.name).toBeDefined();
  });

  it('should get table schema', async () => {
    const schema = await connector.getTableSchema(testTable);
    expect(schema.table).toBe(testTable);
    expect(schema.columns.length).toBeGreaterThanOrEqual(4);
    const names = schema.columns.map((c: any) => c.name);
    expect(names).toContain('name');
    expect(names).toContain('email');
  });

  it('should get primary key', async () => {
    const schema = await connector.getTableSchema(testTable);
    expect(schema.primaryKeys).toContain('id');
  });

  it('should estimate row count', async () => {
    const result = await connector.query(`SELECT COUNT(*) as cnt FROM ${testTable}`);
    const count = parseInt(result.rows[0].cnt);
    expect(count).toBeGreaterThanOrEqual(3);
  });

  it('should extractIncremental after inserting new rows', async () => {
    const fullEvents = await connector.extractFull(testTable);
    const lastTs = fullEvents[fullEvents.length - 1]?.ts;

    await connector.query(`INSERT INTO ${testTable} (name, email, amount) VALUES ('Delta', 'delta@test.com', 400.00)`);

    const allEvents = await connector.extractFull(testTable);
    expect(allEvents.length).toBeGreaterThanOrEqual(4);
    const names = allEvents.map((e: UnifiedChangeEvent) => e.after?.name);
    expect(names).toContain('Delta');
  });

  it('should handle empty table extractFull', async () => {
    await connector.query('CREATE TABLE IF NOT EXISTS empty_test_table (id SERIAL PRIMARY KEY, val TEXT)');
    const events = await connector.extractFull('empty_test_table');
    expect(events).toEqual([]);
    await connector.query('DROP TABLE IF EXISTS empty_test_table');
  });
});
