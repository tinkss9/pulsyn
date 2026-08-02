// abante-cart Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/abante-cart';

const config: ConnectorTestConfig = {
  connectorId: 'test-abante-cart',
  connectorType: 'source',
  engine: 'abante-cart',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
