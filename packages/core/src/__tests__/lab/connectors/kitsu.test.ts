// Kitsu Anime — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/kitsu';

const config: ConnectorTestConfig = {
  connectorId: 'test-kitsu',
  connectorType: 'source',
  engine: 'kitsu',
  config: {
    host: 'https://kitsu.io/api/edge',
  },
  testTables: ['anime'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
