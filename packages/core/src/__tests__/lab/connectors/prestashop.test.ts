// prestashop Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/prestashop';

const config: ConnectorTestConfig = {
  connectorId: 'test-prestashop',
  connectorType: 'source',
  engine: 'prestashop',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
