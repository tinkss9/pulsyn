// @ts-nocheck
// @vitest-environment node
// Integration test: MySQL connector against Docker MySQL (localhost:3306)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { skipIfNoDocker, getTestConfig, waitForService } from './docker-harness';
import { ConnectorRegistry } from '../../connectors/registry';
import '../../connectors/mysql';
import type { UnifiedChangeEvent } from '../../events';

describe('MySQL Live Integration', () => {
  let connector: any;
  const testTable = 'integration_test_orders';
  const config = getTestConfig('mysql');

  beforeAll(async () => {
    skipIfNoDocker('mysql');
    await waitForService(config.host, config.port, 15000);
    connector = ConnectorRegistry.getSource('mysql', 'test-mysql', config);
    await connector.connect(config);
  });

  afterAll(async () => {
    if (connector?.isConnected()) {
      try {
        const pool = connector.getPool?.() || connector;
        await pool.query?.(`DROP TABLE IF EXISTS ${testTable}`);
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
    const pool = connector.getPool?.() || connector;
    const createSql = `
      CREATE TABLE IF NOT EXISTS ${testTable} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL,
        customer_name VARCHAR(100),
        total DECIMAL(10,2),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await pool.query?.(createSql) || await connector.execute?.(createSql);

    const insertSql = `
      INSERT INTO ${testTable} (order_number, customer_name, total, status) VALUES
      ('ORD-001', 'Alice Smith', 150.00, 'completed'),
      ('ORD-002', 'Bob Jones', 275.50, 'pending'),
      ('ORD-003', 'Charlie Brown', 99.99, 'shipped')
    `;
    await pool.query?.(insertSql) || await connector.execute?.(insertSql);
  });

  it('should extractFull and get all rows as events', async () => {
    const events: UnifiedChangeEvent[] = await connector.extractFull(testTable);
    expect(events.length).toBeGreaterThanOrEqual(3);
    expect(events[0].op).toBe('S');
    expect(events[0].table).toBe(testTable);
    expect(events[0].after).toBeDefined();
    expect(events[0].after?.order_number).toBeDefined();
  });

  it('should get table schema', async () => {
    const schema = await connector.getTableSchema(testTable);
    expect(schema.table).toBe(testTable);
    expect(schema.columns.length).toBeGreaterThanOrEqual(5);
    const names = schema.columns.map((c: any) => c.name);
    expect(names).toContain('order_number');
    expect(names).toContain('total');
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
    const fullEvents = await connector.extractFull(testTable);
    const lastWatermark = fullEvents[fullEvents.length - 1]?.watermark;

    // Insert new row after watermark
    const pool = connector.getPool?.() || connector;
    const sql = `INSERT INTO ${testTable} (order_number, customer_name, total, status) VALUES ('ORD-004', 'Delta Force', 500.00, 'processing')`;
    await pool.query?.(sql) || await connector.execute?.(sql);

    const incEvents = await connector.extractIncremental(testTable, lastWatermark);
    expect(incEvents.length).toBeGreaterThanOrEqual(1);
    expect(incEvents[0].op).toBe('I');
    const names = incEvents.map((e: UnifiedChangeEvent) => e.after?.customer_name);
    expect(names).toContain('Delta Force');
  });

  it('should handle empty table extractFull', async () => {
    const pool = connector.getPool?.() || connector;
    await pool.query?.(`CREATE TABLE IF NOT EXISTS empty_mysql_test (id INT PRIMARY KEY, val TEXT)`) ||
      await connector.execute?.(`CREATE TABLE IF NOT EXISTS empty_mysql_test (id INT PRIMARY KEY, val TEXT)`);
    const events = await connector.extractFull('empty_mysql_test');
    expect(events).toEqual([]);
    await pool.query?.('DROP TABLE IF EXISTS empty_mysql_test') ||
      await connector.execute?.('DROP TABLE IF EXISTS empty_mysql_test');
  });
});

