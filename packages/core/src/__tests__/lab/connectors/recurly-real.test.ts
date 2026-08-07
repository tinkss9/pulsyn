// Recurly API v2021-02-25 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/recurly-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-recurly-real',
  connectorType: 'source',
  engine: 'recurly-real',
  config: { host: 'https://v3.recurly.com' },
  testTables: ['accounts', 'subscriptions', 'invoices'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
