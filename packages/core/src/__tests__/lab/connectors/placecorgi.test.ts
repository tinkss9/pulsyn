// PlaceCorgi — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/placecorgi';

const config: ConnectorTestConfig = {
  connectorId: 'test-placecorgi',
  connectorType: 'source',
  engine: 'placecorgi',
  config: {
    host: 'https://placecorgi.com',
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
