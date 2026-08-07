// Mastodon API v1 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mastodon-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-mastodon-real',
  connectorType: 'source',
  engine: 'mastodon-real',
  config: { host: 'https://mastodon.social/api/v1' },
  testTables: ['statuses', 'accounts', 'notifications'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
