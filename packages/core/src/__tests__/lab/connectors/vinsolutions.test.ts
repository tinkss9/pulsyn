// vinsolutions Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/vinsolutions';

const config: ConnectorTestConfig = {
  connectorId: 'test-vinsolutions',
  connectorType: 'source',
  engine: 'vinsolutions',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
