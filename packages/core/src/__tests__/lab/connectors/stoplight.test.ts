// stoplight Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/stoplight';

const config: ConnectorTestConfig = {
  connectorId: 'test-stoplight',
  connectorType: 'source',
  engine: 'stoplight',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
