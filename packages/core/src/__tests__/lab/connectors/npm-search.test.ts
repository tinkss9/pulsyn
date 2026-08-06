// NPM Search — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/npm-search';

const config: ConnectorTestConfig = {
  connectorId: 'test-npm-search',
  connectorType: 'source',
  engine: 'npm-search',
  config: {
    host: 'https://registry.npmjs.org',
  },
  testTables: ['search'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
