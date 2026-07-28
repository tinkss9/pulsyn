// asana Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/asana';

const config: ConnectorTestConfig = {
  connectorId: 'test-asana',
  connectorType: 'source',
  engine: 'asana',
  config: {
    host: 'api.asana.com',
    port: 443,
    database: '',
    username: '',
    password: process.env.TEST_ASANA_API_KEY || '',
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