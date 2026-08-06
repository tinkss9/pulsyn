// Open Food Facts — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/openfoodfacts';

const config: ConnectorTestConfig = {
  connectorId: 'test-openfoodfacts',
  connectorType: 'source',
  engine: 'openfoodfacts',
  config: {
    host: 'https://world.openfoodfacts.org/api/v2',
  },
  testTables: ['products'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
