// TMDB Trending — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tmdb-trending';

const config: ConnectorTestConfig = {
  connectorId: 'test-tmdb-trending',
  connectorType: 'source',
  engine: 'tmdb-trending',
  config: { host: 'https://api.themoviedb.org/3' },
  testTables: ['trending'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
