// GitHub REST API v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-github-real',
  connectorType: 'source',
  engine: 'github-real',
  config: { host: 'https://api.github.com' },
  testTables: ['repos', 'issues', 'pulls'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
