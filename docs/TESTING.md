# Pulsyn Testing Guide

## Overview

Pulsyn has a comprehensive testing infrastructure with 3 layers:

1. **Unit tests** — Individual function/method tests
2. **Integration tests** — Database connection and data flow tests
3. **E2E tests** — Full pipeline tests with real data
4. **Connector Lab** — Standardized test suite for all 776 connectors

## Quick Start

```bash
# Run all tests
npm run test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run E2E tests (requires Playwright)
npm run test:e2e

# Run connector lab tests
cd packages/core && npx vitest run src/__tests__/lab/connectors/
```

## Docker Setup

The connector lab uses 11 Docker services for testing:

```bash
# Start all test databases
docker-compose -f docker-compose.lab.yml up -d

# Verify all services are running
docker-compose -f docker-compose.lab.yml ps
```

### Services

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary relational database |
| MySQL | 3306 | Secondary relational database |
| MongoDB | 27017 | Document database |
| Redis | 6379 | Key-value store |
| MSSQL | 1433 | Microsoft SQL Server |
| ClickHouse | 8123 | Column-oriented analytics |
| Cassandra | 9042 | Wide-column store |
| Elasticsearch | 9200 | Search engine |
| Kafka | 9092 | Message broker |
| DynamoDB | 8000 | AWS DynamoDB (local) |
| LocalStack | 4566 | AWS S3 compatible storage |

## Connector Lab Architecture

### Test Runner (`connector.runner.ts`)

The test runner provides a standardized test suite for all connectors:

```typescript
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/postgresql';

const config: ConnectorTestConfig = {
  connectorId: 'test-postgresql',
  connectorType: 'source',
  engine: 'postgresql',
  config: {
    host: 'localhost',
    port: 5432,
    database: 'testdb',
    username: 'test',
    password: 'test',
  },
  testTables: ['users', 'products'],
  skipCDC: false,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
```

### Test Categories

1. **Unit Tests** (6 tests)
   - `should connect with valid config`
   - `should disconnect cleanly`
   - `should handle double disconnect`
   - `should test connection when connected`
   - `should reject invalid host`
   - `should reject invalid credentials`

2. **Config Tests** (1 test)
   - `should mask password in getConfig()`

3. **Schema Discovery** (3 tests)
   - `should list tables`
   - `should get table schema`
   - `should identify primary keys`

4. **Source Operations** (2 tests)
   - `should extract full from first table`
   - `should extract incremental from first table`

5. **Integration Tests** (4 tests)
   - `should extract all rows from <table>`
   - `should preserve data types`
   - `should return empty on no changes`
   - `should start and stop CDC` (if not skipped)

6. **E2E Tests** (4 tests)
   - `should handle NULL values`
   - `should handle large batches`
   - `should throw when not connected`
   - `should throw when extracting from non-existent table`

7. **Benchmark Tests** (2 tests)
   - `should measure full extract throughput`
   - `should measure incremental extract throughput`

### Skip Logic Constants

The test runner uses 3 constants to handle connector-specific behavior:

```typescript
// Connectors that return empty data (no real connection)
const STUB_ENGINES = [
  'linear', 'asana', 'trello', 'monday', 'clickup',
  'figma', 'calendly', 'zoom', 'google-drive', 'dropbox',
  'mariadb', 'cockroachdb', 'tidb', 'singlestore', 'timescaledb',
  'pulsar', 'rabbitmq', 'activemq', 'nats', 'mqtt',
  'gcs', 'azure-blob', 'backblaze-b2', 'wasabi', 'linode-object',
  'metabase', 'superset', 'grafana', 'redash', 'mode',
  'databricks', 'kinesis', 'hubspot', 'shopify', 'stripe',
];

// Connectors that don't throw on invalid host/credentials
const NO_AUTH_THROW_ENGINES = [
  ...STUB_ENGINES, 'redis', 'dynamodb', 'clickhouse', 's3', 'kafka', 'elasticsearch', 'cassandra',
];

// Connectors that don't mask password in getConfig()
const NO_PASSWORD_MASK_ENGINES = [
  ...STUB_ENGINES, 'redis', 'clickhouse', 's3', 'kafka', 'elasticsearch', 'cassandra', 'r2',
];
```

## Adding a New Connector Test

1. Create a test file in `packages/core/src/__tests__/lab/connectors/`:

```typescript
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/my-connector';

const config: ConnectorTestConfig = {
  connectorId: 'test-my-connector',
  connectorType: 'source',
  engine: 'my-connector',
  config: {
    host: process.env.TEST_MY_CONNECTOR_HOST || 'localhost',
    port: parseInt(process.env.TEST_MY_CONNECTOR_PORT || '1234'),
    database: process.env.TEST_MY_CONNECTOR_DB || 'testdb',
    username: process.env.TEST_MY_CONNECTOR_USER || 'test',
    password: process.env.TEST_MY_CONNECTOR_PASS || 'test',
  },
  testTables: ['test_table'],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
```

2. If the connector needs special handling, add it to the appropriate skip list in `connector.runner.ts`

3. Run the test:
```bash
cd packages/core && npx vitest run src/__tests__/lab/connectors/my-connector.test.ts
```

## Test Results

Current test status (2026-07-29):
- **42 connectors tested**
- **1018 total tests**
- **841 passing (83%)**
- **12 connectors at 100%**

See `docs/ITERATION_TRACKER.md` for detailed per-connector results.
