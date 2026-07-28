// timescaledb Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/timescaledb';

const config: ConnectorTestConfig = {
  connectorId: 'test-timescaledb',
  connectorType: 'source',
  engine: 'timescaledb',
  config: {
    host: process.env.TEST_TIMESCALEDB_HOST || 'localhost',
    port: parseInt(process.env.TEST_TIMESCALEDB_PORT || '3306'),
    database: process.env.TEST_TIMESCALEDB_DB || 'testdb',
    username: process.env.TEST_TIMESCALEDB_USER || 'root',
    password: process.env.TEST_TIMESCALEDB_PASS || 'test',
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