// clustrix Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/clustrix';

const config: ConnectorTestConfig = {
  connectorId: 'test-clustrix',
  connectorType: 'source',
  engine: 'clustrix',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
