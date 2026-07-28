// Databricks Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/databricks';

const config: ConnectorTestConfig = {
  connectorId: 'test-databricks',
  connectorType: 'source',
  engine: 'databricks',
  config: {
    host: process.env.TEST_DATABRICKS_HOST || 'localhost',
    port: 443,
    database: process.env.TEST_DATABRICKS_DB || 'default',
    username: '',
    password: process.env.TEST_DATABRICKS_TOKEN || '',
    path: '/sql/1.0/endpoints',
    ssl: true,
  } as any,
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
