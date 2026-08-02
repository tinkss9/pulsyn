// ziprecruiter Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ziprecruiter';

const config: ConnectorTestConfig = {
  connectorId: 'test-ziprecruiter',
  connectorType: 'source',
  engine: 'ziprecruiter',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
