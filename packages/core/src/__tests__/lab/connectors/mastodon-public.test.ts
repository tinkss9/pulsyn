// Mastodon Public — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mastodon-public';

const config: ConnectorTestConfig = {
  connectorId: 'test-mastodon-public',
  connectorType: 'source',
  engine: 'mastodon-public',
  config: {
    host: 'https://mastodon.social/api/v1',
  },
  testTables: ['trending'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
