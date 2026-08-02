// wizardworld Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/wizardworld';

const config: ConnectorTestConfig = {
  connectorId: 'test-wizardworld',
  connectorType: 'source',
  engine: 'wizardworld',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
