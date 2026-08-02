// MySQL Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mysql';
import '../../../connectors/mysql-target';

const config: ConnectorTestConfig = {
  connectorId: 'test-mysql',
  connectorType: 'source',
  engine: 'mysql',
  config: {
    host: 'localhost',
    port: 3306,
    database: 'testdb',
    username: 'root',
    password: 'test',
  },
  testTables: ['users', 'products', 'orders'],
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 500,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
