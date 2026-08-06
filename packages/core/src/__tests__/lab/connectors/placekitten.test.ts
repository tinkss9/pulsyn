// PlaceKitten — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/placekitten';

const config: ConnectorTestConfig = {
  connectorId: 'test-placekitten',
  connectorType: 'source',
  engine: 'placekitten',
  config: {
    host: 'https://placekitten.com',
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
