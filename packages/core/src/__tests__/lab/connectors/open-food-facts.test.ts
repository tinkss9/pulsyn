// Open Food Facts v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/open-food-facts';

const config: ConnectorTestConfig = {
  connectorId: 'test-open-food-facts',
  connectorType: 'source',
  engine: 'open-food-facts',
  config: { host: 'https://world.openfoodfacts.org/cgi' },
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
