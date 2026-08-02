// waifupics Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/waifupics';

const config: ConnectorTestConfig = {
  connectorId: 'test-waifupics',
  connectorType: 'source',
  engine: 'waifupics',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
