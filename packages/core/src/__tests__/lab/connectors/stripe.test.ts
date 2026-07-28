// Stripe Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/stripe';

const config: ConnectorTestConfig = {
  connectorId: 'test-stripe',
  connectorType: 'source',
  engine: 'stripe',
  config: {
    host: 'api.stripe.com',
    port: 443,
    database: '',
    username: '',
    password: '',
    apiKey: process.env.TEST_STRIPE_API_KEY || '',
    ssl: true,
  } as any,
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
