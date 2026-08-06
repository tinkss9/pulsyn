// TheCocktailDB — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/thecocktaildb';

const config: ConnectorTestConfig = {
  connectorId: 'test-thecocktaildb',
  connectorType: 'source',
  engine: 'thecocktaildb',
  config: {
    host: 'https://www.thecocktaildb.com/api/json/v1/1',
  },
  testTables: ['categories', 'glasses', 'ingredients'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
