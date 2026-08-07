// GitLab API v4 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gitlab-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-gitlab-real',
  connectorType: 'source',
  engine: 'gitlab-real',
  config: { host: 'https://gitlab.com/api/v4' },
  testTables: ['projects', 'issues', 'merge_requests'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
