// Nationalize — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nationalize';

const config: ConnectorTestConfig = {
  connectorId: 'test-nationalize',
  connectorType: 'source',
  engine: 'nationalize',
  config: {
    host: 'https://api.nationalize.io',
  },
  testTables: ['predictions'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
