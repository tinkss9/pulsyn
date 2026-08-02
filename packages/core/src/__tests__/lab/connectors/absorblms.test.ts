// absorblms Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/absorblms';

const config: ConnectorTestConfig = {
  connectorId: 'test-absorblms',
  connectorType: 'source',
  engine: 'absorblms',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
