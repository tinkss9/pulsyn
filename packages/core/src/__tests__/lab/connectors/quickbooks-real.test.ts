// QuickBooks API v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/quickbooks-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-quickbooks-real',
  connectorType: 'source',
  engine: 'quickbooks-real',
  config: { host: 'https://quickbooks.api.intuit.com/v3' },
  testTables: ['customers', 'invoices', 'payments'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
