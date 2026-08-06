// Fill Murray — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/fillmurray';

const config: ConnectorTestConfig = {
  connectorId: 'test-fillmurray',
  connectorType: 'source',
  engine: 'fillmurray',
  config: {
    host: 'https://www.fillmurray.com',
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
