// MusicBrainz — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/musicbrainz';

const config: ConnectorTestConfig = {
  connectorId: 'test-musicbrainz',
  connectorType: 'source',
  engine: 'musicbrainz',
  config: {
    host: 'https://musicbrainz.org/ws/2',
  },
  testTables: ['artists'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
