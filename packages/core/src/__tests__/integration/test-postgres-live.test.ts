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
      // Cleanup test table
      try {
        const client = connector.getClient?.() || connector;
        await client.query?.(`DROP TABLE IF EXISTS ${testTable}`);
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
    const client = connector.getClient?.() || connector;
    const createSql = `
      CREATE TABLE IF NOT EXISTS ${testTable} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(200),
        amount DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await client.query?.(createSql) || await connector.execute?.(createSql);

    const insertSql = `
      INSERT INTO ${testTable} (name, email, amount) VALUES
      ('Alice', 'alice@test.com', 100.50),
      ('Bob', 'bob@test.com', 200.75),
      ('Charlie', 'charlie@test.com', 300.00)
    `;
    await client.query?.(insertSql) || await connector.execute?.(insertSql);
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
    const pk = await connector.getPrimaryKey(testTable);
    expect(pk).toBe('id');
  });

  it('should estimate row count', async () => {
    const count = await connector.estimateRowCount(testTable);
    expect(count).toBeGreaterThanOrEqual(3);
  });

  it('should extractIncremental (CDC) after inserting new rows', async () => {
    // Record watermark before new insert
    const fullEvents = await connector.extractFull(testTable);
    const lastWatermark = fullEvents[fullEvents.length - 1]?.watermark;

    // Insert new row
    const client = connector.getClient?.() || connector;
    const sql = `INSERT INTO ${testTable} (name, email, amount) VALUES ('Delta', 'delta@test.com', 400.00)`;
    await client.query?.(sql) || await connector.execute?.(sql);

    // Extract incremental
    const incEvents = await connector.extractIncremental(testTable, lastWatermark);
    expect(incEvents.length).toBeGreaterThanOrEqual(1);
    expect(incEvents[0].op).toBe('I');
    const names = incEvents.map((e: UnifiedChangeEvent) => e.after?.name);
    expect(names).toContain('Delta');
  });

  it('should handle empty table extractFull', async () => {
    const client = connector.getClient?.() || connector;
    await client.query?.(`CREATE TABLE IF NOT EXISTS empty_test_table (id SERIAL PRIMARY KEY, val TEXT)`) ||
      await connector.execute?.(`CREATE TABLE IF NOT EXISTS empty_test_table (id SERIAL PRIMARY KEY, val TEXT)`);
    const events = await connector.extractFull('empty_test_table');
    expect(events).toEqual([]);
    await client.query?.('DROP TABLE IF EXISTS empty_test_table') ||
      await connector.execute?.('DROP TABLE IF EXISTS empty_test_table');
  });
});

