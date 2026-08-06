// GeoNames — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/geonames';

const config: ConnectorTestConfig = {
  connectorId: 'test-geonames',
  connectorType: 'source',
  engine: 'geonames',
  config: {
    host: 'http://api.geonames.org',
  },
  testTables: ['cities'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
