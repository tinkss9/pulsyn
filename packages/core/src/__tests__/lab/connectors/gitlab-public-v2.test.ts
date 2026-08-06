// GitLab Public v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gitlab-public-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-gitlab-public-v2',
  connectorType: 'source',
  engine: 'gitlab-public-v2',
  config: { host: 'https://gitlab.com/api/v4' },
  testTables: ['projects'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
