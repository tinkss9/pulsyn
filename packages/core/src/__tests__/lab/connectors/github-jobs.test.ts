// GitHub Jobs — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github-jobs';

const config: ConnectorTestConfig = {
  connectorId: 'test-github-jobs',
  connectorType: 'source',
  engine: 'github-jobs',
  config: {
    host: 'https://jobs.github.com',
  },
  testTables: ['positions'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
