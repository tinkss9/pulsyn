// Reddit API v1 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/reddit-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-reddit-real',
  connectorType: 'source',
  engine: 'reddit-real',
  config: { host: 'https://oauth.reddit.com' },
  testTables: ['subreddits', 'posts', 'comments'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
