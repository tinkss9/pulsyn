// GitHub Zen v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github-zen-v3';

const config: ConnectorTestConfig = {
  connectorId: 'test-github-zen-v3',
  connectorType: 'source',
  engine: 'github-zen-v3',
  config: { host: 'https://api.github.com' },
  testTables: ['zen', 'meta'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
