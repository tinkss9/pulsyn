// Nominatim Search — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nominatim-search';

const config: ConnectorTestConfig = {
  connectorId: 'test-nominatim-search',
  connectorType: 'source',
  engine: 'nominatim-search',
  config: { host: 'https://nominatim.openstreetmap.org' },
  testTables: ['search'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
