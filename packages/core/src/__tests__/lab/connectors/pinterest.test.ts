// pinterest Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pinterest';

const config: ConnectorTestConfig = {
  connectorId: 'test-pinterest',
  connectorType: 'source',
  engine: 'pinterest',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
