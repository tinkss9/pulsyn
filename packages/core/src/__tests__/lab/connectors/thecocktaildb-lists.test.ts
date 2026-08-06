// TheCocktailDB Lists — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/thecocktaildb-lists';

const config: ConnectorTestConfig = {
  connectorId: 'test-thecocktaildb-lists',
  connectorType: 'source',
  engine: 'thecocktaildb-lists',
  config: { host: 'https://www.thecocktaildb.com/api/json/v1/1' },
  testTables: ['categories', 'glasses'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
