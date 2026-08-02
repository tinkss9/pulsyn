// infusionsoft Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/infusionsoft';

const config: ConnectorTestConfig = {
  connectorId: 'test-infusionsoft',
  connectorType: 'source',
  engine: 'infusionsoft',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
