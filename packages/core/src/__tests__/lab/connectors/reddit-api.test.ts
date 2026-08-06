// Reddit API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/reddit-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-reddit-api',
  connectorType: 'source',
  engine: 'reddit-api',
  config: { host: 'https://oauth.reddit.com' },
  testTables: ['subreddits'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
