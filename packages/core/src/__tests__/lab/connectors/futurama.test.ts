// Futurama API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/futurama';

const config: ConnectorTestConfig = {
  connectorId: 'test-futurama',
  connectorType: 'source',
  engine: 'futurama',
  config: {
    host: 'https://futuramaapi.herokuapp.com/api',
  },
  testTables: ['quotes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
