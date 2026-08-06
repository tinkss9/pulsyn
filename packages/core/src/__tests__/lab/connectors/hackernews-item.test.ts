// Hacker News Items — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hackernews-item';

const config: ConnectorTestConfig = {
  connectorId: 'test-hackernews-item',
  connectorType: 'source',
  engine: 'hackernews-item',
  config: { host: 'https://hacker-news.firebaseio.com/v0' },
  testTables: ['top'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
