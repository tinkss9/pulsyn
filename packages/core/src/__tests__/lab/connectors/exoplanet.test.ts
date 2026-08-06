// Exoplanet Archive — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/exoplanet';

const config: ConnectorTestConfig = {
  connectorId: 'test-exoplanet',
  connectorType: 'source',
  engine: 'exoplanet',
  config: {
    host: 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync',
  },
  testTables: ['planets'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
