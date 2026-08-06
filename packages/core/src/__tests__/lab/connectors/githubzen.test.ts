// GitHub Zen — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/githubzen';

const config: ConnectorTestConfig = {
  connectorId: 'test-githubzen',
  connectorType: 'source',
  engine: 'githubzen',
  config: {
    host: 'https://api.github.com',
  },
  testTables: ['zen', 'emojis'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
