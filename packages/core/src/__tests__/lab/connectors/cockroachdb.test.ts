// cockroachdb Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cockroachdb';

const config: ConnectorTestConfig = {
  connectorId: 'test-cockroachdb',
  connectorType: 'source',
  engine: 'cockroachdb',
  config: {
    host: process.env.TEST_COCKROACHDB_HOST || 'localhost',
    port: parseInt(process.env.TEST_COCKROACHDB_PORT || '3306'),
    database: process.env.TEST_COCKROACHDB_DB || 'testdb',
    username: process.env.TEST_COCKROACHDB_USER || 'root',
    password: process.env.TEST_COCKROACHDB_PASS || 'test',
  },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();