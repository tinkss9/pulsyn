// Square API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/square-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-square-real',
  connectorType: 'source',
  engine: 'square-real',
  config: { host: 'https://connect.squareup.com/v2' },
  testTables: ['payments', 'customers', 'orders'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
