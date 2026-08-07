// Twitter API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/twitter-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-twitter-real',
  connectorType: 'source',
  engine: 'twitter-real',
  config: { host: 'https://api.twitter.com/2' },
  testTables: ['tweets', 'users', 'spaces'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
