// CircleCI API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/circleci-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-circleci-api',
  connectorType: 'source',
  engine: 'circleci-api',
  config: { host: 'https://circleci.com/api/v2' },
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
