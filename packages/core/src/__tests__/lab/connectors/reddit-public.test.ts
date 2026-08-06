// Reddit Public — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/reddit-public';

const config: ConnectorTestConfig = {
  connectorId: 'test-reddit-public',
  connectorType: 'source',
  engine: 'reddit-public',
  config: {
    host: 'https://www.reddit.com',
  },
  testTables: ['subreddits'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
