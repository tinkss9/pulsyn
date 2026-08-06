// Nominatim Geocode — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/geocode';

const config: ConnectorTestConfig = {
  connectorId: 'test-geocode',
  connectorType: 'source',
  engine: 'geocode',
  config: {
    host: 'https://nominatim.openstreetmap.org',
  },
  testTables: ['search'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
