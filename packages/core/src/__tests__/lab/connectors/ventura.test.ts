// Ventura API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ventura';

const config: ConnectorTestConfig = {
  connectorId: 'test-ventura',
  connectorType: 'source',
  engine: 'ventura',
  config: {
    host: 'https://ventura-api.herokuapp.com',
  },
  testTables: ['people'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
