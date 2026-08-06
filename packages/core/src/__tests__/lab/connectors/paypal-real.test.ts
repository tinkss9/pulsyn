// PayPal — Comprehensive Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/paypal-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-paypal-real',
  connectorType: 'source',
  engine: 'paypal-real',
  config: { host: 'https://api-m.paypal.com/v1' },
  testTables: ['payments', 'invoices', 'subscriptions'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
