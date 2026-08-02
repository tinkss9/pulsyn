// playbookux Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/playbookux';

const config: ConnectorTestConfig = {
  connectorId: 'test-playbookux',
  connectorType: 'source',
  engine: 'playbookux',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
