// Braintree GraphQL API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/braintree-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-braintree-real',
  connectorType: 'source',
  engine: 'braintree-real',
  config: { host: 'https://payments.braintree-api.com/graphql' },
  testTables: ['transactions', 'customers', 'subscriptions'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
