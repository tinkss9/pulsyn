// squarespace Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/squarespace';

const config: ConnectorTestConfig = {
  connectorId: 'test-squarespace',
  connectorType: 'source',
  engine: 'squarespace',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
