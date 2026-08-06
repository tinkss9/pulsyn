// Spotify Public — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/spotify-public';

const config: ConnectorTestConfig = {
  connectorId: 'test-spotify-public',
  connectorType: 'source',
  engine: 'spotify-public',
  config: {
    host: 'https://api.spotify.com/v1',
  },
  testTables: ['featured'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
