// GitHub Users Explore — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github-users-explore';

const config: ConnectorTestConfig = {
  connectorId: 'test-github-users-explore',
  connectorType: 'source',
  engine: 'github-users-explore',
  config: { host: 'https://api.github.com' },
  testTables: ['users'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
