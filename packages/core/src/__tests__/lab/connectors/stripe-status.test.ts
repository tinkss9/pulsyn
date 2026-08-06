// Stripe Status — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/stripe-status';

const config: ConnectorTestConfig = {
  connectorId: 'test-stripe-status',
  connectorType: 'source',
  engine: 'stripe-status',
  config: { host: 'https://status.stripe.com/api/v2' },
  testTables: ['status'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
