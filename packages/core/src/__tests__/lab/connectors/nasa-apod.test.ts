// NASA APOD — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nasa-apod';

const config: ConnectorTestConfig = {
  connectorId: 'test-nasa-apod',
  connectorType: 'source',
  engine: 'nasa-apod',
  config: {
    host: 'https://api.nasa.gov/planetary',
  },
  testTables: ['apod'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
