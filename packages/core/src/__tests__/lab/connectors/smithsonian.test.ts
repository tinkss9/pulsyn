// Smithsonian API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/smithsonian';

const config: ConnectorTestConfig = {
  connectorId: 'test-smithsonian',
  connectorType: 'source',
  engine: 'smithsonian',
  config: {
    host: 'https://api.si.edu/openaccess/api/v1.0',
  },
  testTables: ['search'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
