// omnifocus Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/omnifocus';

const config: ConnectorTestConfig = {
  connectorId: 'test-omnifocus',
  connectorType: 'source',
  engine: 'omnifocus',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
