// dynamics-365 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dynamics-365';

const config: ConnectorTestConfig = {
  connectorId: 'test-dynamics-365',
  connectorType: 'source',
  engine: 'dynamics-365',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
