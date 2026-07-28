// clickup Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/clickup';

const config: ConnectorTestConfig = {
  connectorId: 'test-clickup',
  connectorType: 'source',
  engine: 'clickup',
  config: {
    host: 'api.clickup.com',
    port: 443,
    database: '',
    username: '',
    password: process.env.TEST_CLICKUP_API_KEY || '',
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