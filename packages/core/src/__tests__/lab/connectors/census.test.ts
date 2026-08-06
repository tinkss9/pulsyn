// US Census — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/census';

const config: ConnectorTestConfig = {
  connectorId: 'test-census',
  connectorType: 'source',
  engine: 'census',
  config: {
    host: 'https://api.census.gov',
  },
  testTables: ['data'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
