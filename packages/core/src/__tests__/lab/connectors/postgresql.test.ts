// PostgreSQL Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/postgresql';
import '../../../connectors/postgresql-target';

const config: ConnectorTestConfig = {
  connectorId: 'test-pg',
  connectorType: 'source',
  engine: 'postgresql',
  config: {
    host: process.env.TEST_PG_HOST || 'localhost',
    port: parseInt(process.env.TEST_PG_PORT || '5432'),
    database: process.env.TEST_PG_DB || 'testdb',
    username: process.env.TEST_PG_USER || 'test',
    password: process.env.TEST_PG_PASS || 'test',
  },
  testTables: ['users', 'products', 'orders', 'events'],
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 1000,
};

const runner = createConnectorTests(config);

// Run all test suites
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
