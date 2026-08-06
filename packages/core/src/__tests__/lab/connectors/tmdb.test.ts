// TMDB (The Movie DB) — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tmdb';

const config: ConnectorTestConfig = {
  connectorId: 'test-tmdb',
  connectorType: 'source',
  engine: 'tmdb',
  config: {
    host: 'https://api.themoviedb.org/3',
  },
  testTables: ['trending'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
