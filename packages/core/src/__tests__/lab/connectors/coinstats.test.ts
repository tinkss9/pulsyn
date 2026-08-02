// coinstats Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/coinstats';

const config: ConnectorTestConfig = {
  connectorId: 'test-coinstats',
  connectorType: 'source',
  engine: 'coinstats',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
