// Chargebee API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/chargebee-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-chargebee-real',
  connectorType: 'source',
  engine: 'chargebee-real',
  config: { host: 'https://{site}.chargebee.com/api/v2' },
  testTables: ['customers', 'subscriptions', 'invoices'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
