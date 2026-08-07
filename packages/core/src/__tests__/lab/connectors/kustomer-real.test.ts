// Kustomer API v1 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/kustomer-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-kustomer-real',
  connectorType: 'source',
  engine: 'kustomer-real',
  config: { host: 'https://api.kustomerapp.com/v1' },
  testTables: ['customers', 'conversations', 'messages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
