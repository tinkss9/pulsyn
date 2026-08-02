// little-green-light Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/little-green-light';

const config: ConnectorTestConfig = {
  connectorId: 'test-little-green-light',
  connectorType: 'source',
  engine: 'little-green-light',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
