// GitHub Emojis — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github-emojis';

const config: ConnectorTestConfig = {
  connectorId: 'test-github-emojis',
  connectorType: 'source',
  engine: 'github-emojis',
  config: { host: 'https://api.github.com' },
  testTables: ['emojis'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
