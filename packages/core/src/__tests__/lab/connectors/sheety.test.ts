// Sheety API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sheety';

const config: ConnectorTestConfig = {
  connectorId: 'test-sheety',
  connectorType: 'source',
  engine: 'sheety',
  config: {
    host: 'https://api.sheety.co',
  },
  testTables: ['users'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
