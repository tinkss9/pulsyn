// NPM Trending — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/npm-trending';

const config: ConnectorTestConfig = {
  connectorId: 'test-npm-trending',
  connectorType: 'source',
  engine: 'npm-trending',
  config: { host: 'https://registry.npmjs.org' },
  testTables: ['search'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
