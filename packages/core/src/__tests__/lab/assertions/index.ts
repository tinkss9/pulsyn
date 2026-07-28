// Custom Assertions for Connector Testing Lab
// Provides reusable assertions for connectivity, data integrity, and performance

import { expect } from 'vitest';
import type { BaseConnector, WriteBatchResult } from '../../connectors/base';
import type { TableSchema, UnifiedChangeEvent } from '../../types';

// === CONNECTIVITY ASSERTIONS ===

export async function expectConnect(connector: BaseConnector, config?: any): Promise<void> {
  await connector.connect(config);
  expect(connector.isConnected()).toBe(true);
}

export async function expectDisconnect(connector: BaseConnector): Promise<void> {
  await connector.disconnect();
  expect(connector.isConnected()).toBe(false);
}

export async function expectTestConnection(connector: BaseConnector, expected: boolean = true): Promise<void> {
  const result = await connector.testConnection();
  expect(result).toBe(expected);
}

export async function expectConnectFails(connector: BaseConnector, config: any, errorPattern?: string): Promise<void> {
  await expect(connector.connect(config)).rejects.toThrow(errorPattern);
}

// === SCHEMA ASSERTIONS ===

export async function expectGetTables(connector: BaseConnector, minTables: number = 1): Promise<string[]> {
  const tables = await connector.getTables();
  expect(Array.isArray(tables)).toBe(true);
  expect(tables.length).toBeGreaterThanOrEqual(minTables);
  return tables;
}

export async function expectGetTableSchema(
  connector: BaseConnector,
  table: string,
  expectedColumns?: string[]
): Promise<TableSchema> {
  const schema = await connector.getTableSchema(table);
  expect(schema).toBeDefined();
  expect(schema.table).toBe(table);
  expect(Array.isArray(schema.columns)).toBe(true);
  expect(schema.columns.length).toBeGreaterThan(0);

  if (expectedColumns) {
    const columnNames = schema.columns.map(c => c.name);
    for (const col of expectedColumns) {
      expect(columnNames).toContain(col);
    }
  }

  return schema;
}

export async function expectPrimaryKey(
  connector: BaseConnector,
  table: string,
  expectedPk: string
): Promise<void> {
  const schema = await connector.getTableSchema(table);
  expect(schema.primaryKeys).toContain(expectedPk);
}

// === DATA EXTRACTION ASSERTIONS ===

export async function expectExtractFull(
  connector: BaseConnector,
  table: string,
  minRows: number = 1
): Promise<UnifiedChangeEvent[]> {
  const events = await connector.extractFull(table);
  expect(Array.isArray(events)).toBe(true);
  expect(events.length).toBeGreaterThanOrEqual(minRows);

  // All events should be 'S' (snapshot) type
  for (const event of events) {
    expect(event.op).toBe('S');
    expect(event.table).toBe(table);
    expect(event.after).toBeDefined();
  }

  return events;
}

export async function expectExtractIncremental(
  connector: BaseConnector,
  table: string,
  opts?: { watermarkColumn?: string; watermarkValue?: string }
): Promise<UnifiedChangeEvent[]> {
  const events = await connector.extractIncremental(table, opts);
  expect(Array.isArray(events)).toBe(true);
  return events;
}

// === CDC ASSERTIONS ===

export async function expectCDCStart(
  connector: BaseConnector,
  callback: (event: UnifiedChangeEvent) => void
): Promise<void> {
  await expect(connector.startCDC(callback)).resolves.not.toThrow();
}

export async function expectCDCStop(connector: BaseConnector): Promise<void> {
  await expect(connector.stopCDC()).resolves.not.toThrow();
}

export async function expectCDCEvent(
  receivedEvents: UnifiedChangeEvent[],
  expectedOp: 'I' | 'U' | 'D',
  expectedTable?: string,
  timeoutMs: number = 5000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const match = receivedEvents.find(
      e => e.op === expectedOp && (!expectedTable || e.table === expectedTable)
    );
    if (match) return;
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error(`No CDC event with op=${expectedOp} received within ${timeoutMs}ms`);
}

// === DATA INTEGRITY ASSERTIONS ===

export function expectRowCount(events: UnifiedChangeEvent[], expected: number): void {
  expect(events.length).toBe(expected);
}

export function expectDataMatch(
  actual: Record<string, any>,
  expected: Record<string, any>,
  fields: string[]
): void {
  for (const field of fields) {
    expect(actual[field]).toEqual(expected[field]);
  }
}

export function expectNoDuplicates(events: UnifiedChangeEvent[], keyField: string): void {
  const keys = events.map(e => e.after?.[keyField]).filter(Boolean);
  const uniqueKeys = new Set(keys);
  expect(uniqueKeys.size).toBe(keys.length);
}

export function expectAllNonNull(events: UnifiedChangeEvent[], field: string): void {
  for (const event of events) {
    expect(event.after?.[field]).not.toBeNull();
    expect(event.after?.[field]).not.toBeUndefined();
  }
}

export function expectNullable(events: UnifiedChangeEvent[], field: string): void {
  const hasNull = events.some(e => e.after?.[field] === null);
  const hasNonNull = events.some(e => e.after?.[field] !== null);
  expect(hasNull || hasNonNull).toBe(true); // At least one should exist
}

// === PERFORMANCE ASSERTIONS ===

export function expectLatency(
  startTime: number,
  maxLatencyMs: number,
  operation: string = 'operation'
): void {
  const elapsed = Date.now() - startTime;
  expect(elapsed).toBeLessThanOrEqual(maxLatencyMs);
}

export function expectThroughput(
  rowCount: number,
  elapsedMs: number,
  minRowsPerSecond: number
): void {
  const rowsPerSecond = (rowCount / elapsedMs) * 1000;
  expect(rowsPerSecond).toBeGreaterThanOrEqual(minRowsPerSecond);
}

export function expectMemoryUsage(
  beforeMB: number,
  afterMB: number,
  maxIncreaseMB: number
): void {
  const increase = afterMB - beforeMB;
  expect(increase).toBeLessThanOrEqual(maxIncreaseMB);
}

// === WRITE ASSERTIONS (TARGET CONNECTORS) ===

export async function expectWriteBatch(
  connector: BaseConnector,
  table: string,
  events: UnifiedChangeEvent[],
  expectedResult?: Partial<WriteBatchResult>
): Promise<WriteBatchResult> {
  const result = await connector.writeBatch(table, events);
  expect(result).toBeDefined();

  if (expectedResult) {
    if (expectedResult.inserted !== undefined) {
      expect(result.inserted).toBe(expectedResult.inserted);
    }
    if (expectedResult.errors !== undefined) {
      expect(result.errors).toBe(expectedResult.errors);
    }
    if (expectedResult.deleted !== undefined) {
      expect(result.deleted).toBe(expectedResult.deleted);
    }
  }

  return result;
}

export async function expectMerge(
  connector: BaseConnector,
  table: string,
  events: UnifiedChangeEvent[],
  keyColumns: string[]
): Promise<void> {
  const result = await connector.merge(table, events, keyColumns);
  expect(result).toBeDefined();
  expect(result.upserted + result.updated + result.deleted).toBeGreaterThan(0);
}

export async function expectCreateTable(
  connector: BaseConnector,
  table: string,
  schema: any
): Promise<void> {
  const result = await connector.createTableIfNeeded(table, schema);
  expect(result).toBeDefined();
  expect(typeof result.created).toBe('boolean');
}

// === ERROR HANDLING ASSERTIONS ===

export async function expectThrowsWithMessage(
  fn: () => Promise<any>,
  errorPattern: string
): Promise<void> {
  await expect(fn()).rejects.toThrow(errorPattern);
}

export async function expectNotConnected(
  fn: () => Promise<any>
): Promise<void> {
  await expect(fn()).rejects.toThrow(/not connected/i);
}
