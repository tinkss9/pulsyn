// MSSQL Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mssql';
import '../../../connectors/mssql-target';

const config: ConnectorTestConfig = {
  connectorId: 'test-mssql',
  connectorType: 'source',
  engine: 'mssql',
  config: {
    host: 'localhost',
    port: 1433,
    database: 'master',
    username: 'sa',
    password: 'Test@12345',
  },
  testTables: ['dbo.users', 'dbo.products', 'dbo.orders'],
  skipCDC: true,
  skipBenchmark: false,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
