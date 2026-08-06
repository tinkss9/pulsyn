// GitHub Status v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github-status-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-github-status-v2',
  connectorType: 'source',
  engine: 'github-status-v2',
  config: { host: 'https://www.githubstatus.com/api/v2' },
  testTables: ['status'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
