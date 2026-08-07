// GitHub Actions — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github-actions-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-github-actions-real',
  connectorType: 'source',
  engine: 'github-actions-real',
  config: { host: 'https://api.github.com' },
  testTables: ['workflows', 'runs', 'jobs'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
