// touchbistro Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/touchbistro';

const config: ConnectorTestConfig = {
  connectorId: 'test-touchbistro',
  connectorType: 'source',
  engine: 'touchbistro',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
