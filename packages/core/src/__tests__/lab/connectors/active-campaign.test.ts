// active-campaign Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/active-campaign';

const config: ConnectorTestConfig = {
  connectorId: 'test-active-campaign',
  connectorType: 'source',
  engine: 'active-campaign',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
