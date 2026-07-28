// linear Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/linear';

const config: ConnectorTestConfig = {
  connectorId: 'test-linear',
  connectorType: 'source',
  engine: 'linear',
  config: {
    host: 'api.linear.com',
    port: 443,
    database: '',
    username: '',
    password: process.env.TEST_LINEAR_API_KEY || '',
    ssl: true,
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