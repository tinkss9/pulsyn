import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseConnector } from '../../connectors/base';
import { getTestConnector, TEST_TABLE } from './conftest';

describe('Extraction Conformance', () => {
  let connector: BaseConnector;

  beforeEach(async () => {
    connector = getTestConnector();
    await connector.connect();
  });

  afterEach(async () => {
    await connector.disconnect();
  });

  it('should return events from extractFull', async () => {
    const events = await connector.extractFull(TEST_TABLE);
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);
  });

  it('should return events with required fields', async () => {
    const events = await connector.extractFull(TEST_TABLE);
    for (const event of events) {
      expect(event).toHaveProperty('op');
      expect(event).toHaveProperty('table');
      expect(event).toHaveProperty('after');
      expect(event).toHaveProperty('ts');
    }
  });

  it('should support pagination with limit and offset', async () => {
    const page1 = await connector.extractFull(TEST_TABLE, { limit: 5, offset: 0 });
    const page2 = await connector.extractFull(TEST_TABLE, { limit: 5, offset: 5 });

    expect(page1.length).toBeLessThanOrEqual(5);
    expect(page2.length).toBeLessThanOrEqual(5);

    if (page1.length === 5 && page2.length > 0) {
      const page1Keys = page1.map((e: any) => JSON.stringify(e.key));
      const page2Keys = page2.map((e: any) => JSON.stringify(e.key));
      const overlap = page1Keys.filter((k: string) => page2Keys.includes(k));
      expect(overlap.length).toBe(0);
    }
  });

  it('should return empty array for empty table', async () => {
    const events = await connector.extractFull('empty_table_conformance');
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBe(0);
  });

  it('should respect batch size configuration', async () => {
    const batchSize = 3;
    const events = await connector.extractFull(TEST_TABLE, { limit: batchSize });
    expect(events.length).toBeLessThanOrEqual(batchSize);
  });

  it('should support incremental extraction with watermark', async () => {
    const watermark = new Date(Date.now() - 86400000).toISOString();
    const events = await connector.extractIncremental(TEST_TABLE, {
      watermarkColumn: 'created_at',
      watermarkValue: watermark,
    });

    expect(Array.isArray(events)).toBe(true);
    for (const event of events) {
      expect(event).toHaveProperty('after');
      if (event.after.created_at) {
        expect(new Date(event.after.created_at).getTime()).toBeGreaterThanOrEqual(
          new Date(watermark).getTime()
        );
      }
    }
  });

  it('should set op=S for snapshot events from extractFull', async () => {
    const events = await connector.extractFull(TEST_TABLE);
    for (const event of events) {
      expect(event.op).toBe('S');
    }
  });
});
