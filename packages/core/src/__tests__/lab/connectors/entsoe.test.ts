// entsoe Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/entso-e';

const config: ConnectorTestConfig = {
  connectorId: 'test-entsoe',
  connectorType: 'source',
  engine: 'entsoe',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
