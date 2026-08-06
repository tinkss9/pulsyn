// Tumblr API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tumblr';

const config: ConnectorTestConfig = {
  connectorId: 'test-tumblr',
  connectorType: 'source',
  engine: 'tumblr',
  config: {
    host: 'https://api.tumblr.com/v2',
  },
  testTables: ['blog'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
