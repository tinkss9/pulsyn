// cdiscount Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cdiscount';

const config: ConnectorTestConfig = {
  connectorId: 'test-cdiscount',
  connectorType: 'source',
  engine: 'cdiscount',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
