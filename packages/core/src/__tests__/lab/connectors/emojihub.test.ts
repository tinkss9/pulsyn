// emojihub Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/emojihub';

const config: ConnectorTestConfig = {
  connectorId: 'test-emojihub',
  connectorType: 'source',
  engine: 'emojihub',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
