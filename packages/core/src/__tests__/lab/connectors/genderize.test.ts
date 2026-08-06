// Genderize — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/genderize';

const config: ConnectorTestConfig = {
  connectorId: 'test-genderize',
  connectorType: 'source',
  engine: 'genderize',
  config: {
    host: 'https://api.genderize.io',
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
