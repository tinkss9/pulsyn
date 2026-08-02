// bigcommerce Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bigcommerce';

const config: ConnectorTestConfig = {
  connectorId: 'test-bigcommerce',
  connectorType: 'source',
  engine: 'bigcommerce',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
