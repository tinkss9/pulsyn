// Open Food Facts Search — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/openfoodfacts-search';

const config: ConnectorTestConfig = {
  connectorId: 'test-openfoodfacts-search',
  connectorType: 'source',
  engine: 'openfoodfacts-search',
  config: { host: 'https://world.openfoodfacts.org/api/v2' },
  testTables: ['products'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
