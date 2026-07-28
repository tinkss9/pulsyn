// MongoDB Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mongodb';
import '../../../connectors/mongodb-target';

const config: ConnectorTestConfig = {
  connectorId: 'test-mongo',
  connectorType: 'source',
  engine: 'mongodb',
  config: {
    host: process.env.TEST_MONGO_HOST || 'localhost',
    port: parseInt(process.env.TEST_MONGO_PORT || '27017'),
    database: process.env.TEST_MONGO_DB || 'testdb',
    username: process.env.TEST_MONGO_USER || 'test',
    password: process.env.TEST_MONGO_PASS || 'test',
  },
  testTables: ['users', 'products', 'orders'],
  skipCDC: false,
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
