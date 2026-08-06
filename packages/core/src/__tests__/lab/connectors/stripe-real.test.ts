// Stripe Real Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/stripe-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-stripe-real',
  connectorType: 'source',
  engine: 'stripe-real',
  config: {
    host: 'https://api.stripe.com/v1',
    // token: '<Stripe test mode API key sk_test_*>',
  },
  testTables: ['charges', 'customers', 'products', 'events'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
