// gotomeeting Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gotomeeting';

const config: ConnectorTestConfig = {
  connectorId: 'test-gotomeeting',
  connectorType: 'source',
  engine: 'gotomeeting',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
