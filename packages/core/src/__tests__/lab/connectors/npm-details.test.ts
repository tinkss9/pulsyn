// NPM Package Details — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/npm-details';

const config: ConnectorTestConfig = {
  connectorId: 'test-npm-details',
  connectorType: 'source',
  engine: 'npm-details',
  config: { host: 'https://registry.npmjs.org' },
  testTables: ['package'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
