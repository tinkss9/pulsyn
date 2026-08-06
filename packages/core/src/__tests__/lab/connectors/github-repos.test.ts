// GitHub Repos — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github-repos';

const config: ConnectorTestConfig = {
  connectorId: 'test-github-repos',
  connectorType: 'source',
  engine: 'github-repos',
  config: { host: 'https://api.github.com' },
  testTables: ['repos', 'trending'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
