// GitLab CI — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gitlab-ci';

const config: ConnectorTestConfig = {
  connectorId: 'test-gitlab-ci',
  connectorType: 'source',
  engine: 'gitlab-ci',
  config: { host: 'https://gitlab.com/api/v4' },
  testTables: ['pipelines'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
