// Hacker News Top — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hackernews-top';

const config: ConnectorTestConfig = {
  connectorId: 'test-hackernews-top',
  connectorType: 'source',
  engine: 'hackernews-top',
  config: { host: 'https://hacker-news.firebaseio.com/v0' },
  testTables: ['top', 'best', 'new'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
