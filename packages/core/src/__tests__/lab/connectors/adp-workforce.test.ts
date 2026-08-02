// adp-workforce Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/adp-workforce';

const config: ConnectorTestConfig = {
  connectorId: 'test-adp-workforce',
  connectorType: 'source',
  engine: 'adp-workforce',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
