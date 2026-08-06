// NPM Registry — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/npm-registry';

const config: ConnectorTestConfig = {
  connectorId: 'test-npm-registry',
  connectorType: 'source',
  engine: 'npm-registry',
  config: {
    host: 'https://registry.npmjs.org',
  },
  testTables: ['package'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
