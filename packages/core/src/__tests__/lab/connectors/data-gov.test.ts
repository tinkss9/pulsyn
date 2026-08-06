// Data.gov — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/data-gov';

const config: ConnectorTestConfig = {
  connectorId: 'test-data-gov',
  connectorType: 'source',
  engine: 'data-gov',
  config: {
    host: 'https://api.data.gov',
  },
  testTables: ['usda'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
