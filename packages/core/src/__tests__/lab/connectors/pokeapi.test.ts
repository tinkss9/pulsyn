// PokéAPI Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pokeapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-pokeapi',
  connectorType: 'source',
  engine: 'pokeapi',
  config: {
    host: 'https://pokeapi.co',
  },
  testTables: ['pokemon', 'berry', 'ability'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
