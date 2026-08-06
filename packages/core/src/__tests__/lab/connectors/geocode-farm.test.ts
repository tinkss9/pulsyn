// Geocode Farm — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/geocode-farm';

const config: ConnectorTestConfig = {
  connectorId: 'test-geocode-farm',
  connectorType: 'source',
  engine: 'geocode-farm',
  config: { host: 'https://www.geocode.farm/v3' },
  testTables: ['geocode'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
