// OMDB API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/omdb';

const config: ConnectorTestConfig = {
  connectorId: 'test-omdb',
  connectorType: 'source',
  engine: 'omdb',
  config: {
    host: 'https://www.omdbapi.com',
  },
  testTables: ['movies'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
