// socketlabs Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/socketlabs';

const config: ConnectorTestConfig = {
  connectorId: 'test-socketlabs',
  connectorType: 'source',
  engine: 'socketlabs',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
