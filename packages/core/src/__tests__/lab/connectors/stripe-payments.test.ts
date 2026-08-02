// stripe-payments Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/stripe-payments';

const config: ConnectorTestConfig = {
  connectorId: 'test-stripe-payments',
  connectorType: 'source',
  engine: 'stripe-payments',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
