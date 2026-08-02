// focus-nfe Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/focus-nfe';

const config: ConnectorTestConfig = {
  connectorId: 'test-focus-nfe',
  connectorType: 'source',
  engine: 'focus-nfe',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
