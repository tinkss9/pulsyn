// savvycal Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/savvycal';

const config: ConnectorTestConfig = {
  connectorId: 'test-savvycal',
  connectorType: 'source',
  engine: 'savvycal',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
