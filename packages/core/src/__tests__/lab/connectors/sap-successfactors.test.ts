// sap-successfactors Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sap-successfactors';

const config: ConnectorTestConfig = {
  connectorId: 'test-sap-successfactors',
  connectorType: 'source',
  engine: 'sap-successfactors',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
