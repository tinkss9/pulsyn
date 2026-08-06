// Hacker News — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hackernews';

const config: ConnectorTestConfig = {
  connectorId: 'test-hackernews',
  connectorType: 'source',
  engine: 'hackernews',
  config: {
    host: 'https://hacker-news.firebaseio.com/v0',
  },
  testTables: ['top', 'item'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
