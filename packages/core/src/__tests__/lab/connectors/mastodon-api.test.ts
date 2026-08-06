// Mastodon API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mastodon-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-mastodon-api',
  connectorType: 'source',
  engine: 'mastodon-api',
  config: { host: 'https://mastodon.social/api/v1' },
  testTables: ['trending'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
