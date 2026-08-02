// ceridian Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ceridian';

const config: ConnectorTestConfig = {
  connectorId: 'test-ceridian',
  connectorType: 'source',
  engine: 'ceridian',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
