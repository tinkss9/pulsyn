// GitHub Users — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github-user';

const config: ConnectorTestConfig = {
  connectorId: 'test-github-user',
  connectorType: 'source',
  engine: 'github-user',
  config: {
    host: 'https://api.github.com',
  },
  testTables: ['users'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
