// MySQL Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mysql';
import '../../../connectors/mysql-target';

const config: ConnectorTestConfig = {
  connectorId: 'test-mysql',
  connectorType: 'source',
  engine: 'mysql',
  config: {
    host: process.env.TEST_MYSQL_HOST || 'localhost',
    port: parseInt(process.env.TEST_MYSQL_PORT || '3306'),
    database: process.env.TEST_MYSQL_DB || 'testdb',
    username: process.env.TEST_MYSQL_USER || 'root',
    password: process.env.TEST_MYSQL_PASS || 'test',
  },
  testTables: ['users', 'products', 'orders'],
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 1000,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
