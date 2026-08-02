// checkout-com Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/checkout-com';

const config: ConnectorTestConfig = {
  connectorId: 'test-checkout-com',
  connectorType: 'source',
  engine: 'checkout-com',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
