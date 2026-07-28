// tidb Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tidb';

const config: ConnectorTestConfig = {
  connectorId: 'test-tidb',
  connectorType: 'source',
  engine: 'tidb',
  config: {
    host: process.env.TEST_TIDB_HOST || 'localhost',
    port: parseInt(process.env.TEST_TIDB_PORT || '3306'),
    database: process.env.TEST_TIDB_DB || 'testdb',
    username: process.env.TEST_TIDB_USER || 'root',
    password: process.env.TEST_TIDB_PASS || 'test',
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