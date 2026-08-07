// Xero API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/xero-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-xero-real',
  connectorType: 'source',
  engine: 'xero-real',
  config: { host: 'https://api.xero.com/api.xro/2.0' },
  testTables: ['invoices', 'contacts', 'accounts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
