// EarthCam — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cameras';

const config: ConnectorTestConfig = {
  connectorId: 'test-cameras',
  connectorType: 'source',
  engine: 'cameras',
  config: {
    host: 'https://api.earthcam.com/v1',
  },
  testTables: ['cameras'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
