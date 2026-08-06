// GitLab Public — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gitlab-public';

const config: ConnectorTestConfig = {
  connectorId: 'test-gitlab-public',
  connectorType: 'source',
  engine: 'gitlab-public',
  config: {
    host: 'https://gitlab.com/api/v4',
  },
  testTables: ['projects'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
