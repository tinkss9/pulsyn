// GitLab Projects — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gitlab-projects';

const config: ConnectorTestConfig = {
  connectorId: 'test-gitlab-projects',
  connectorType: 'source',
  engine: 'gitlab-projects',
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
