// applied-epic Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/applied-epic';

const config: ConnectorTestConfig = {
  connectorId: 'test-applied-epic',
  connectorType: 'source',
  engine: 'applied-epic',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
