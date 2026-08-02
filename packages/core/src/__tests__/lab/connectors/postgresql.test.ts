// PostgreSQL Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/postgresql';
import '../../../connectors/postgresql-target';

const config: ConnectorTestConfig = {
  connectorId: 'test-pg',
  connectorType: 'source',
  engine: 'postgresql',
  config: {
    host: 'localhost',
    port: 5432,
    database: 'testdb',
    username: 'test',
    password: 'test',
  },
  testTables: ['users', 'products', 'orders'],
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 500,
};

const runner = createConnectorTests(config);

// Run all test suites
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
