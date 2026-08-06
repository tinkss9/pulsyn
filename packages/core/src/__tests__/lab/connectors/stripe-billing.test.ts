// Stripe Billing — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/stripe-billing';

const config: ConnectorTestConfig = {
  connectorId: 'test-stripe-billing',
  connectorType: 'source',
  engine: 'stripe-billing',
  config: { host: 'https://api.stripe.com/v1' },
  testTables: ['subscriptions', 'invoices'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
