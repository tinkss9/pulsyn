// Cassandra Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cassandra';

const config: ConnectorTestConfig = {
  connectorId: 'test-cassandra',
  connectorType: 'source',
  engine: 'cassandra',
  config: {
    host: process.env.TEST_CASSANDRA_HOST || 'localhost',
    port: parseInt(process.env.TEST_CASSANDRA_PORT || '9042'),
    database: process.env.TEST_CASSANDRA_DB || 'testdb',
    username: process.env.TEST_CASSANDRA_USER || '',
    password: process.env.TEST_CASSANDRA_PASS || '',
  },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
