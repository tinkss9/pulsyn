// Bored API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bored-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-bored-api',
  connectorType: 'source',
  engine: 'bored-api',
  config: { host: 'https://bored-api.appbrewery.com' },
  testTables: ['activities'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
