// singlestore Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/singlestore';

const config: ConnectorTestConfig = {
  connectorId: 'test-singlestore',
  connectorType: 'source',
  engine: 'singlestore',
  config: {
    host: process.env.TEST_SINGLESTORE_HOST || 'localhost',
    port: parseInt(process.env.TEST_SINGLESTORE_PORT || '3306'),
    database: process.env.TEST_SINGLESTORE_DB || 'testdb',
    username: process.env.TEST_SINGLESTORE_USER || 'root',
    password: process.env.TEST_SINGLESTORE_PASS || 'test',
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