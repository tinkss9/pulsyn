// Last.fm API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/lastfm';

const config: ConnectorTestConfig = {
  connectorId: 'test-lastfm',
  connectorType: 'source',
  engine: 'lastfm',
  config: {
    host: 'https://ws.audioscrobbler.com/2.0',
  },
  testTables: ['topartists'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
