// NASA APOD v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nasa-apod-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-nasa-apod-v2',
  connectorType: 'source',
  engine: 'nasa-apod-v2',
  config: { host: 'https://api.nasa.gov/planetary' },
  testTables: ['apod'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
