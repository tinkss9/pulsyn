// CircleCI API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/circleci-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-circleci-real',
  connectorType: 'source',
  engine: 'circleci-real',
  config: { host: 'https://circleci.com/api/v2' },
  testTables: ['pipelines', 'workflows', 'jobs'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
