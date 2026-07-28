// Redshift Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/redshift';

const config: ConnectorTestConfig = {
  connectorId: 'test-redshift',
  connectorType: 'source',
  engine: 'redshift',
  config: {
    host: process.env.TEST_REDSHIFT_HOST || 'localhost',
    port: parseInt(process.env.TEST_REDSHIFT_PORT || '5439'),
    database: process.env.TEST_REDSHIFT_DB || 'testdb',
    username: process.env.TEST_REDSHIFT_USER || 'test',
    password: process.env.TEST_REDSHIFT_PASS || 'test',
    ssl: false,
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
