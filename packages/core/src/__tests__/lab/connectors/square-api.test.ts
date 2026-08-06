// Square API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/square-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-square-api',
  connectorType: 'source',
  engine: 'square-api',
  config: { host: 'https://connect.squareup.com/v2' },
  testTables: ['payments'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
