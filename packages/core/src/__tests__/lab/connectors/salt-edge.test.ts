// salt-edge Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/salt-edge';

const config: ConnectorTestConfig = {
  connectorId: 'test-salt-edge',
  connectorType: 'source',
  engine: 'salt-edge',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
