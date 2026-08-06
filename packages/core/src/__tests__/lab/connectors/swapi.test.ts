// Star Wars API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/swapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-swapi',
  connectorType: 'source',
  engine: 'swapi',
  config: {
    host: 'https://swapi.dev/api',
  },
  testTables: ['people', 'planets', 'starships'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
