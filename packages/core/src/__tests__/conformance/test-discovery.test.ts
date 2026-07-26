// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseConnector } from '../../connectors/base';
import { getTestConnector, TEST_TABLE } from './conftest';

describe('Discovery Conformance', () => {
  let connector: BaseConnector;

  beforeEach(async () => {
    connector = getTestConnector();
    await connector.connect();
  });

  afterEach(async () => {
    await connector.disconnect();
  });

  it('should return an array from getTables', async () => {
    const tables = await connector.getTables();
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should return table names as strings', async () => {
    const tables = await connector.getTables();
    for (const table of tables) {
      expect(typeof table.name).toBe('string');
      expect(table.name.length).toBeGreaterThan(0);
    }
  });

  it('should return schema with columns array', async () => {
    const schema = await connector.getTableSchema(TEST_TABLE);
    expect(schema).toBeDefined();
    expect(Array.isArray(schema.columns)).toBe(true);
    expect(schema.columns.length).toBeGreaterThan(0);
  });

  it('should include column name and type in schema', async () => {
    const schema = await connector.getTableSchema(TEST_TABLE);
    for (const col of schema.columns) {
      expect(col).toHaveProperty('name');
      expect(col).toHaveProperty('type');
      expect(typeof col.name).toBe('string');
      expect(typeof col.type).toBe('string');
    }
  });

  it('should identify primary key columns', async () => {
    const schema = await connector.getTableSchema(TEST_TABLE);
    const pkColumns = schema.columns.filter((c: any) => c.primaryKey === true);
    expect(pkColumns.length).toBeGreaterThanOrEqual(1);
    expect(pkColumns[0].name).toBe('id');
  });

  it('should include nullable property in schema', async () => {
    const schema = await connector.getTableSchema(TEST_TABLE);
    for (const col of schema.columns) {
      expect(col).toHaveProperty('nullable');
      expect(typeof col.nullable).toBe('boolean');
    }
  });
});

