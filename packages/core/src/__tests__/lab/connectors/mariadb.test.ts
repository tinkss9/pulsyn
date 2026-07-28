// mariadb Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mariadb';

const config: ConnectorTestConfig = {
  connectorId: 'test-mariadb',
  connectorType: 'source',
  engine: 'mariadb',
  config: {
    host: process.env.TEST_MARIADB_HOST || 'localhost',
    port: parseInt(process.env.TEST_MARIADB_PORT || '3306'),
    database: process.env.TEST_MARIADB_DB || 'testdb',
    username: process.env.TEST_MARIADB_USER || 'root',
    password: process.env.TEST_MARIADB_PASS || 'test',
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