// GitHub Zen v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github-zen2';

const config: ConnectorTestConfig = {
  connectorId: 'test-github-zen2',
  connectorType: 'source',
  engine: 'github-zen2',
  config: { host: 'https://api.github.com' },
  testTables: ['zen'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
