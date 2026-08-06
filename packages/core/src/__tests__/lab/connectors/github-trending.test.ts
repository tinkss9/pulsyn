// GitHub Trending — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github-trending';

const config: ConnectorTestConfig = {
  connectorId: 'test-github-trending',
  connectorType: 'source',
  engine: 'github-trending',
  config: {
    host: 'https://api.gitterapp.com',
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
