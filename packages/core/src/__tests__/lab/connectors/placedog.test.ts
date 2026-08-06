// PlaceDog — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/placedog';

const config: ConnectorTestConfig = {
  connectorId: 'test-placedog',
  connectorType: 'source',
  engine: 'placedog',
  config: {
    host: 'https://place.dog',
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
