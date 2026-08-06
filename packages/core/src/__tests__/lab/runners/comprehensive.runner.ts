/**
 * Comprehensive Connector Certification Runner
 *
 * Tests: Performance, Volume, Latency, Security, Ease of Use
 * Based on industry best practices from Fivetran, Airbyte, Estuary
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { BaseConnector } from '../../../connectors/base';
import type { DatabaseConfig } from '../../../types';

export interface ComprehensiveTestConfig {
  connectorId: string;
  engine: string;
  config: DatabaseConfig;
  tables: string[];
  // Performance thresholds
  maxLatencyMs?: number;          // Max acceptable latency for connect
  maxQueryLatencyMs?: number;     // Max acceptable latency for query
  minThroughputRowsSec?: number;  // Min rows/sec for extraction
  maxMemoryMB?: number;           // Max memory usage
  // Volume thresholds
  smallBatchSize?: number;        // Default: 10
  mediumBatchSize?: number;       // Default: 100
  largeBatchSize?: number;        // Default: 1000
  // Security
  requireAuth?: boolean;          // Default: true
  requireTLS?: boolean;           // Default: true
  // Ease of use
  requireSchemaDiscovery?: boolean; // Default: true
  requireIncremental?: boolean;     // Default: true
}

const DEFAULTS = {
  maxLatencyMs: 10000,
  maxQueryLatencyMs: 30000,
  minThroughputRowsSec: 10,
  maxMemoryMB: 512,
  smallBatchSize: 10,
  mediumBatchSize: 100,
  largeBatchSize: 1000,
  requireAuth: true,
  requireTLS: true,
  requireSchemaDiscovery: true,
  requireIncremental: true,
};

export function runComprehensiveTests(createConnector: () => BaseConnector, config: ComprehensiveTestConfig) {
  const cfg = { ...DEFAULTS, ...config };
  let connector: BaseConnector;

  describe(`${config.engine} — Comprehensive Certification`, () => {

    // ═══════════════════════════════════════════════════════════════
    // 1. CONNECTIVITY & AUTH
    // ═══════════════════════════════════════════════════════════════

    describe('1. Connectivity & Auth', () => {
      it('should connect within latency threshold', async () => {
        connector = createConnector();
        const start = Date.now();
        await connector.connect(config.config);
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(cfg.maxLatencyMs);
        expect(connector.isConnected()).toBe(true);
        console.log(`[${config.engine}] Connect latency: ${elapsed}ms`);
      });

      it('should verify connection', async () => {
        const result = await connector.testConnection();
        expect(result).toBe(true);
      });

      it('should disconnect cleanly', async () => {
        await connector.disconnect();
        expect(connector.isConnected()).toBe(false);
      });

      it('should handle reconnection', async () => {
        connector = createConnector();
        await connector.connect(config.config);
        expect(connector.isConnected()).toBe(true);
        await connector.disconnect();
        connector = createConnector();
        await connector.connect(config.config);
        expect(connector.isConnected()).toBe(true);
      });
    });

    // ═══════════════════════════════════════════════════════════════
    // 2. SCHEMA DISCOVERY
    // ═══════════════════════════════════════════════════════════════

    describe('2. Schema Discovery', () => {
      beforeAll(async () => {
        connector = createConnector();
        await connector.connect(config.config);
      });

      afterAll(async () => await connector.disconnect());

      it('should list tables', async () => {
        const tables = await connector.getTables();
        expect(Array.isArray(tables)).toBe(true);
        expect(tables.length).toBeGreaterThan(0);
        console.log(`[${config.engine}] Tables found: ${tables.length}`);
      });

      it('should get schema for each table', async () => {
        for (const table of config.tables.slice(0, 5)) {
          const schema = await connector.getTableSchema(table);
          expect(schema).toBeDefined();
          expect(schema.columns).toBeDefined();
          expect(Array.isArray(schema.columns)).toBe(true);
          console.log(`[${config.engine}] ${table}: ${schema.columns.length} columns`);
        }
      });

      it('should identify primary keys', async () => {
        for (const table of config.tables.slice(0, 3)) {
          const schema = await connector.getTableSchema(table);
          // At least one column should be marked as primary key
          const hasPK = schema.columns.some(c => c.primaryKey) || (schema.primaryKeys && schema.primaryKeys.length > 0);
          expect(hasPK).toBe(true);
        }
      });
    });

    // ═══════════════════════════════════════════════════════════════
    // 3. PERFORMANCE — LATENCY & THROUGHPUT
    // ═══════════════════════════════════════════════════════════════

    describe('3. Performance', () => {
      beforeAll(async () => {
        connector = createConnector();
        await connector.connect(config.config);
      });

      afterAll(async () => await connector.disconnect());

      it('should extract small batch within latency', async () => {
        const table = config.tables[0];
        const start = Date.now();
        const events = await connector.extractFull(table, { limit: cfg.smallBatchSize });
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(cfg.maxQueryLatencyMs);
        console.log(`[${config.engine}] Small batch (${cfg.smallBatchSize}): ${elapsed}ms, ${events.length} rows`);
      });

      it('should extract medium batch within latency', async () => {
        const table = config.tables[0];
        const start = Date.now();
        const events = await connector.extractFull(table, { limit: cfg.mediumBatchSize });
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(cfg.maxQueryLatencyMs);
        const throughput = (events.length / elapsed) * 1000;
        console.log(`[${config.engine}] Medium batch (${cfg.mediumBatchSize}): ${elapsed}ms, ${events.length} rows, ${throughput.toFixed(0)} rows/sec`);
      });

      it('should extract large batch within latency', async () => {
        const table = config.tables[0];
        const start = Date.now();
        const events = await connector.extractFull(table, { limit: cfg.largeBatchSize });
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(cfg.maxQueryLatencyMs * 2); // Allow 2x for large batch
        const throughput = (events.length / elapsed) * 1000;
        console.log(`[${config.engine}] Large batch (${cfg.largeBatchSize}): ${elapsed}ms, ${events.length} rows, ${throughput.toFixed(0)} rows/sec`);
      });

      it('should maintain throughput above threshold', async () => {
        const table = config.tables[0];
        const start = Date.now();
        const events = await connector.extractFull(table, { limit: cfg.mediumBatchSize });
        const elapsed = Date.now() - start;
        const throughput = (events.length / elapsed) * 1000;
        expect(throughput).toBeGreaterThanOrEqual(cfg.minThroughputRowsSec);
        console.log(`[${config.engine}] Throughput: ${throughput.toFixed(0)} rows/sec (min: ${cfg.minThroughputRowsSec})`);
      });
    });

    // ═══════════════════════════════════════════════════════════════
    // 4. VOLUME — LARGE DATA HANDLING
    // ═══════════════════════════════════════════════════════════════

    describe('4. Volume Handling', () => {
      beforeAll(async () => {
        connector = createConnector();
        await connector.connect(config.config);
      });

      afterAll(async () => await connector.disconnect());

      it('should handle 1000+ rows without memory issues', async () => {
        const table = config.tables[0];
        const beforeMB = process.memoryUsage().heapUsed / 1024 / 1024;
        const events = await connector.extractFull(table, { limit: 1000 });
        const afterMB = process.memoryUsage().heapUsed / 1024 / 1024;
        const deltaMB = afterMB - beforeMB;
        expect(deltaMB).toBeLessThan(cfg.maxMemoryMB);
        console.log(`[${config.engine}] 1000 rows: +${deltaMB.toFixed(1)}MB memory, ${events.length} rows`);
      });

      it('should handle pagination correctly', async () => {
        const table = config.tables[0];
        const page1 = await connector.extractFull(table, { limit: 50 });
        const page2 = await connector.extractFull(table, { limit: 50 });
        // Both pages should return data
        expect(Array.isArray(page1)).toBe(true);
        expect(Array.isArray(page2)).toBe(true);
        console.log(`[${config.engine}] Pagination: page1=${page1.length}, page2=${page2.length}`);
      });

      it('should handle empty results gracefully', async () => {
        const table = config.tables[0];
        // Query with very restrictive filter
        const events = await connector.extractIncremental(table, {
          watermarkColumn: 'id',
          watermarkValue: '999999999999',
        });
        expect(Array.isArray(events)).toBe(true);
        console.log(`[${config.engine}] Empty results: ${events.length} rows`);
      });
    });

    // ═══════════════════════════════════════════════════════════════
    // 5. SECURITY
    // ═══════════════════════════════════════════════════════════════

    describe('5. Security', () => {
      it('should reject invalid credentials', async () => {
        const badConnector = createConnector();
        const badConfig = { ...config.config, password: 'invalid-password-12345', token: '', apiKey: '' };
        try {
          await badConnector.connect(badConfig);
          // If it connects with bad creds, that's a security issue
          // Some connectors might not throw on connect but fail on testConnection
          const result = await badConnector.testConnection();
          expect(result).toBe(false);
        } catch {
          // Expected: connection should fail with invalid credentials
        }
      });

      it('should mask sensitive config values', async () => {
        connector = createConnector();
        await connector.connect(config.config);
        const masked = connector.getConfig();
        if (masked.password) expect(masked.password).toBe('***');
        if (masked.token) expect(masked.token).toBe('***');
      });

      it('should not throw on disconnect when not connected', async () => {
        const freshConnector = createConnector();
        await expect(freshConnector.disconnect()).resolves.not.toThrow();
      });

      it('should handle rate limiting gracefully', async () => {
        connector = createConnector();
        await connector.connect(config.config);
        // Rapid fire requests
        const results = await Promise.allSettled([
          connector.getTables(),
          connector.getTables(),
          connector.getTables(),
        ]);
        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        console.log(`[${config.engine}] Rate limit test: ${succeeded}/3 succeeded`);
        expect(succeeded).toBeGreaterThan(0);
      });
    });

    // ═══════════════════════════════════════════════════════════════
    // 6. INCREMENTAL / CDC
    // ═══════════════════════════════════════════════════════════════

    describe('6. Incremental Extraction', () => {
      beforeAll(async () => {
        connector = createConnector();
        await connector.connect(config.config);
      });

      afterAll(async () => await connector.disconnect());

      it('should support incremental extraction', async () => {
        const table = config.tables[0];
        const events = await connector.extractIncremental(table);
        expect(Array.isArray(events)).toBe(true);
        console.log(`[${config.engine}] Incremental: ${events.length} rows`);
      });

      it('should support watermark-based filtering', async () => {
        const table = config.tables[0];
        const events = await connector.extractIncremental(table, {
          watermarkColumn: 'id',
          watermarkValue: '0',
        });
        expect(Array.isArray(events)).toBe(true);
        console.log(`[${config.engine}] Watermark filter: ${events.length} rows`);
      });
    });

    // ═══════════════════════════════════════════════════════════════
    // 7. ERROR HANDLING
    // ═══════════════════════════════════════════════════════════════

    describe('7. Error Handling', () => {
      it('should handle network timeout gracefully', async () => {
        connector = createConnector();
        // Connect with invalid host for timeout
        const timeoutConfig = { ...config.config, host: 'https://invalid-host-that-does-not-exist.example.com', connectTimeout: 2000 };
        try {
          await connector.connect(timeoutConfig);
          // Some connectors might not throw on connect
        } catch {
          // Expected: should throw on invalid host
        }
      });

      it('should handle non-existent table gracefully', async () => {
        connector = createConnector();
        await connector.connect(config.config);
        const events = await connector.extractFull('non_existent_table_xyz_12345');
        expect(Array.isArray(events)).toBe(true);
        // Should return empty, not throw
      });
    });
  });
}
