// sap-business-one Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sap-business-one';

const config: ConnectorTestConfig = {
  connectorId: 'test-sap-business-one',
  connectorType: 'source',
  engine: 'sap-business-one',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
