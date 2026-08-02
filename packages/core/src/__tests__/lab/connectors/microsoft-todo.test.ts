// microsoft-todo Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/microsoft-todo';

const config: ConnectorTestConfig = {
  connectorId: 'test-microsoft-todo',
  connectorType: 'source',
  engine: 'microsoft-todo',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
