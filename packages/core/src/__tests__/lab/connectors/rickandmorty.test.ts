// Rick and Morty API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/rickandmorty';

const config: ConnectorTestConfig = {
  connectorId: 'test-rickandmorty',
  connectorType: 'source',
  engine: 'rickandmorty',
  config: {
    host: 'https://rickandmortyapi.com/api',
  },
  testTables: ['characters', 'locations', 'episodes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
