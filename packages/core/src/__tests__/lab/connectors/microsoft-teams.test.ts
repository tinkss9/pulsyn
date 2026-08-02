// microsoft-teams Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/microsoft-teams';

const config: ConnectorTestConfig = {
  connectorId: 'test-microsoft-teams',
  connectorType: 'source',
  engine: 'microsoft-teams',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
