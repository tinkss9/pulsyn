// GitHub Meta — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github-meta';

const config: ConnectorTestConfig = {
  connectorId: 'test-github-meta',
  connectorType: 'source',
  engine: 'github-meta',
  config: { host: 'https://api.github.com' },
  testTables: ['meta'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
