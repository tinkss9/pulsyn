// IGDB/Twitch — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/igdb';

const config: ConnectorTestConfig = {
  connectorId: 'test-igdb',
  connectorType: 'source',
  engine: 'igdb',
  config: {
    host: 'https://api.igdb.com/v4',
  },
  testTables: ['games'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
