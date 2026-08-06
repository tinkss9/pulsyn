// Shibe Online — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/shibe';

const config: ConnectorTestConfig = {
  connectorId: 'test-shibe',
  connectorType: 'source',
  engine: 'shibe',
  config: {
    host: 'https://shibe.online/api',
  },
  testTables: ['shibes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
