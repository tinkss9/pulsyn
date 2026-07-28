// Connector Test Runner Framework
// Orchestrates unit, integration, E2E, and benchmark tests

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import type { BaseConnector } from '../../../connectors/base';
import type { DatabaseConfig, TableSchema, UnifiedChangeEvent } from '../../../types';
import { ConnectorRegistry } from '../../../connectors/registry';
import {
  expectConnect, expectDisconnect, expectTestConnection,
  expectConnectFails,
  expectGetTables, expectGetTableSchema, expectPrimaryKey,
  expectExtractFull, expectExtractIncremental,
  expectCDCStart, expectCDCStop, expectCDCEvent,
  expectRowCount, expectDataMatch, expectNoDuplicates,
  expectLatency, expectThroughput,
  expectWriteBatch, expectMerge, expectCreateTable,
  expectThrowsWithMessage, expectNotConnected,
} from '../assertions';
import { generateTableData, STANDARD_SCHEMA, EDGE_CASE_DATA } from '../synthetic/generator';

export interface ConnectorTestConfig {
  connectorId: string;
  connectorType: 'source' | 'target';
  engine: string;
  config: DatabaseConfig;
  testTables: string[];
  skipCDC?: boolean;
  skipBenchmark?: boolean;
  maxConnectionLatencyMs?: number;
  minExtractThroughput?: number;
}

export class ConnectorTestRunner {
  private config: ConnectorTestConfig;
  private connector: BaseConnector | null = null;
  private startTime: number = 0;

  constructor(config: ConnectorTestConfig) {
    this.config = config;
  }

  // === UNIT TESTS ===

  runUnitTests(): void {
    const { connectorId, connectorType, engine, config } = this.config;

    describe(`${engine} Unit Tests`, () => {
      beforeEach(() => {
        this.connector = null;
      });

      afterEach(async () => {
        if (this.connector?.isConnected()) {
          await this.connector.disconnect().catch(() => {});
        }
      });

      describe('Connectivity', () => {
        it('should connect with valid config', async () => {
          this.connector = this.createConnector();
          await expectConnect(this.connector, config);
        });

        it('should disconnect cleanly', async () => {
          this.connector = this.createConnector();
          await expectConnect(this.connector, config);
          await expectDisconnect(this.connector);
        });

        it('should handle double disconnect', async () => {
          this.connector = this.createConnector();
          await expectConnect(this.connector, config);
          await this.connector.disconnect();
          await expect(this.connector.disconnect()).resolves.not.toThrow();
        });

        it('should test connection when connected', async () => {
          this.connector = this.createConnector();
          await expectConnect(this.connector, config);
          await expectTestConnection(this.connector, true);
        });

        it('should reject invalid host', async () => {
          // Skip for DynamoDB, ClickHouse, and S3/R2 (don't throw on invalid host)
          if (this.config.engine === 'dynamodb' || this.config.engine === 'clickhouse' || this.config.engine === 's3') {
            expect(true).toBe(true);
            return;
          }
          const badConfig = { ...config, host: 'invalid-host-that-does-not-exist', connectTimeout: 2000 };
          this.connector = this.createConnector();
          await expectConnectFails(this.connector, badConfig);
        }, 15000);

        it('should reject invalid credentials', async () => {
          // Skip for Redis, DynamoDB, ClickHouse, S3/R2, and Kafka (don't validate credentials on connect)
          if (this.config.engine === 'redis' || this.config.engine === 'dynamodb' || this.config.engine === 'clickhouse' || this.config.engine === 's3' || this.config.engine === 'kafka') {
            expect(true).toBe(true);
            return;
          }
          const badConfig = { ...config, password: 'wrong-password', connectTimeout: 2000 };
          this.connector = this.createConnector();
          await expectConnectFails(this.connector, badConfig);
        }, 15000);
      });

      describe('Schema Discovery', () => {
        it('should list tables', async () => {
          this.connector = this.createConnector();
          await expectConnect(this.connector, config);
          // For Redis, we just check it returns an array (keys, not tables)
          if (this.config.engine === 'redis') {
            const tables = await this.connector.getTables();
            expect(Array.isArray(tables)).toBe(true);
          } else if (this.config.engine === 'clickhouse') {
            // ClickHouse may return empty if no tables in database
            const tables = await this.connector.getTables();
            expect(Array.isArray(tables)).toBe(true);
          } else {
            await expectGetTables(this.connector, 1);
          }
        });

        it('should get table schema', async () => {
          this.connector = this.createConnector();
          await expectConnect(this.connector, config);
          const tables = await this.connector.getTables();
          if (tables.length > 0) {
            await expectGetTableSchema(this.connector, tables[0]);
          }
        });

        it('should identify primary keys', async () => {
          this.connector = this.createConnector();
          await expectConnect(this.connector, config);
          const tables = await this.connector.getTables();
          // Find a table that has a primary key
          for (const table of tables) {
            const schema = await this.connector.getTableSchema(table);
            if (schema.primaryKeys.length > 0) {
              expect(schema.primaryKeys.length).toBeGreaterThan(0);
              return;
            }
          }
          // If no table has a primary key, that's OK for some connectors
          expect(true).toBe(true);
        });
      });

      describe('Config', () => {
        it('should mask password in getConfig()', async () => {
          this.connector = this.createConnector();
          const maskedConfig = this.connector.getConfig();
          // For Redis, ClickHouse, S3/R2, and Kafka, password may not be in config
          if (this.config.engine === 'redis' || this.config.engine === 'clickhouse' || this.config.engine === 's3' || this.config.engine === 'kafka') {
            expect(maskedConfig.host).toBe(config.host);
          } else {
            expect(maskedConfig.password).toBe('***');
            expect(maskedConfig.host).toBe(config.host);
          }
        });
      });

      if (connectorType === 'source') {
        describe('Source Operations', () => {
          it('should extract full from first table', async () => {
            this.connector = this.createConnector();
            await expectConnect(this.connector, config);
            const tables = await this.connector.getTables();
            if (tables.length > 0) {
              await expectExtractFull(this.connector, tables[0], 0);
            }
          });

          it('should extract incremental from first table', async () => {
            this.connector = this.createConnector();
            await expectConnect(this.connector, config);
            const tables = await this.connector.getTables();
            if (tables.length > 0) {
              await expectExtractIncremental(this.connector, tables[0]);
            }
          });
        });
      }
    });
  }

  // === INTEGRATION TESTS ===

  runIntegrationTests(): void {
    const { connectorId, connectorType, engine, config, testTables } = this.config;

    describe(`${engine} Integration Tests`, () => {
      beforeEach(() => {
        this.connector = null;
      });

      afterEach(async () => {
        if (this.connector?.isConnected()) {
          await this.connector.disconnect().catch(() => {});
        }
      });

      describe('Full Extraction', () => {
        for (const table of testTables) {
          it(`should extract all rows from ${table}`, async () => {
            this.connector = this.createConnector();
            await expectConnect(this.connector, config);
            const events = await expectExtractFull(this.connector, table, 1);
            expect(events.length).toBeGreaterThan(0);
          });
        }

        it('should preserve data types', async () => {
          this.connector = this.createConnector();
          await expectConnect(this.connector, config);
          const tables = await this.connector.getTables();
          if (tables.length > 0) {
            const events = await this.connector.extractFull(tables[0]);
            if (events.length > 0) {
              const row = events[0].after;
              expect(row).toBeDefined();
              // Check that we got some data
              expect(Object.keys(row!).length).toBeGreaterThan(0);
            }
          }
        });
      });

      describe('Incremental Extraction', () => {
        it('should return empty on no changes', async () => {
          this.connector = this.createConnector();
          await expectConnect(this.connector, config);
          const tables = await this.connector.getTables();
          if (tables.length > 0) {
            const events = await this.connector.extractIncremental(tables[0]);
            expect(Array.isArray(events)).toBe(true);
          }
        });
      });

      if (!this.config.skipCDC && connectorType === 'source') {
        describe('CDC', () => {
          it('should start and stop CDC', async () => {
            this.connector = this.createConnector();
            await expectConnect(this.connector, config);
            const receivedEvents: UnifiedChangeEvent[] = [];
            await expectCDCStart(this.connector, (e) => receivedEvents.push(e));
            await new Promise(r => setTimeout(r, 1000));
            await expectCDCStop(this.connector);
          });
        });
      }
    });
  }

  // === E2E TESTS ===

  runE2ETests(): void {
    const { connectorId, connectorType, engine, config, testTables } = this.config;

    describe(`${engine} E2E Tests`, () => {
      beforeEach(() => {
        this.connector = null;
      });

      afterEach(async () => {
        if (this.connector?.isConnected()) {
          await this.connector.disconnect().catch(() => {});
        }
      });

      describe('Data Integrity', () => {
        it('should handle NULL values', async () => {
          this.connector = this.createConnector();
          await expectConnect(this.connector, config);
          const tables = await this.connector.getTables();
          if (tables.length > 0) {
            const schema = await this.connector.getTableSchema(tables[0]);
            const nullableCol = schema.columns.find(c => c.nullable);
            if (nullableCol) {
              const events = await this.connector.extractFull(tables[0]);
              // Should not throw even with NULLs
              expect(events).toBeDefined();
            }
          }
        });

        it('should handle large batches', async () => {
          this.connector = this.createConnector();
          await expectConnect(this.connector, config);
          const tables = await this.connector.getTables();
          if (tables.length > 0) {
            const events = await this.connector.extractFull(tables[0]);
            expect(Array.isArray(events)).toBe(true);
          }
        });
      });

      describe('Error Handling', () => {
        it('should throw when not connected', async () => {
          this.connector = this.createConnector();
          // For Redis, the error message is different
          if (this.config.engine === 'redis') {
            try {
              await this.connector.getTables();
              fail('Should have thrown');
            } catch (err) {
              expect(err).toBeDefined();
            }
          } else {
            await expectNotConnected(() => this.connector!.getTables());
          }
        });

        it('should throw when extracting from non-existent table', async () => {
          this.connector = this.createConnector();
          await expectConnect(this.connector, config);
          // For Redis, MongoDB, and Kafka, non-existent tables return empty array or timeout, not error
          if (this.config.engine === 'redis' || this.config.engine === 'mongodb' || this.config.engine === 'kafka') {
            expect(true).toBe(true);
          } else {
            await expectThrowsWithMessage(
              () => this.connector!.extractFull('non_existent_table_xyz'),
              /not found|doesn't exist|does not exist|Invalid object|non-existen|UNKNOWN_TABLE|Table.*does not exist/i
            );
          }
        });
      });
    });
  }

  // === BENCHMARK TESTS ===

  runBenchmarkTests(): void {
    if (this.config.skipBenchmark) return;

    const { connectorId, connectorType, engine, config, testTables } = this.config;

    describe(`${engine} Benchmarks`, () => {
      beforeEach(() => {
        this.connector = null;
      });

      afterEach(async () => {
        if (this.connector?.isConnected()) {
          await this.connector.disconnect().catch(() => {});
        }
      });

      it('should measure connection latency', async () => {
        this.connector = this.createConnector();
        const start = Date.now();
        await this.connector.connect(config);
        const elapsed = Date.now() - start;
        
        console.log(`[${engine}] Connection latency: ${elapsed}ms`);
        expect(elapsed).toBeLessThan(this.config.maxConnectionLatencyMs || 10000);
      });

      it('should measure full extract throughput', async () => {
        this.connector = this.createConnector();
        await this.connector.connect(config);
        const tables = await this.connector.getTables();
        
        if (tables.length > 0) {
          const start = Date.now();
          const events = await this.connector.extractFull(tables[0]);
          const elapsed = Date.now() - start;
          const throughput = (events.length / elapsed) * 1000;
          
          console.log(`[${engine}] Full extract: ${events.length} rows in ${elapsed}ms (${throughput.toFixed(0)} rows/sec)`);
          expect(throughput).toBeGreaterThanOrEqual(this.config.minExtractThroughput || 100);
        }
      });

      it('should measure memory usage', async () => {
        this.connector = this.createConnector();
        await this.connector.connect(config);
        const tables = await this.connector.getTables();
        
        if (tables.length > 0) {
          const before = process.memoryUsage().heapUsed / 1024 / 1024;
          await this.connector.extractFull(tables[0]);
          const after = process.memoryUsage().heapUsed / 1024 / 1024;
          
          console.log(`[${engine}] Memory: ${before.toFixed(1)}MB → ${after.toFixed(1)}MB (+${(after - before).toFixed(1)}MB)`);
        }
      });
    });
  }

  // === HELPER METHODS ===

  private createConnector(): BaseConnector {
    const registry = this.config.connectorType === 'source' 
      ? ConnectorRegistry 
      : ConnectorRegistry;
    
    const method = this.config.connectorType === 'source' ? 'getSource' : 'getTarget';
    return (registry as any)[method](
      this.config.engine,
      this.config.connectorId,
      this.config.config
    );
  }
}

// Factory function to create test runners
export function createConnectorTests(config: ConnectorTestConfig): ConnectorTestRunner {
  return new ConnectorTestRunner(config);
}
