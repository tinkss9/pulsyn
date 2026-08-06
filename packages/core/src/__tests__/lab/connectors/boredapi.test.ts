// Bored API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/boredapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-boredapi',
  connectorType: 'source',
  engine: 'boredapi',
  config: {
    host: 'https://bored-api.appbrewery.com',
  },
  testTables: ['activities'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
