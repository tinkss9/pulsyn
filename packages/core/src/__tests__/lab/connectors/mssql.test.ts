// MSSQL Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mssql';
import '../../../connectors/mssql-target';

const config: ConnectorTestConfig = {
  connectorId: 'test-mssql',
  connectorType: 'source',
  engine: 'mssql',
  config: {
    host: process.env.TEST_MSSQL_HOST || 'localhost',
    port: parseInt(process.env.TEST_MSSQL_PORT || '1433'),
    database: process.env.TEST_MSSQL_DB || 'testdb',
    username: process.env.TEST_MSSQL_USER || 'sa',
    password: process.env.TEST_MSSQL_PASS || 'Test@12345',
  },
  testTables: ['users', 'products', 'orders'],
  skipCDC: true,
  skipBenchmark: false,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 500,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
