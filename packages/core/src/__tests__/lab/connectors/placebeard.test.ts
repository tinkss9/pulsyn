// PlaceBeard — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/placebeard';

const config: ConnectorTestConfig = {
  connectorId: 'test-placebeard',
  connectorType: 'source',
  engine: 'placebeard',
  config: {
    host: 'https://placebeard.it',
  },
  testTables: ['images'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
