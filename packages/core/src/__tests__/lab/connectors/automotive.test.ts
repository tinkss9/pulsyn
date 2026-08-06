// NHTSA Vehicles — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/automotive';

const config: ConnectorTestConfig = {
  connectorId: 'test-automotive',
  connectorType: 'source',
  engine: 'automotive',
  config: {
    host: 'https://vpic.nhtsa.dot.gov/api',
  },
  testTables: ['makes', 'models'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
