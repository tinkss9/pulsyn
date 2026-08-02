// katana-mrp Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/katana-mrp';

const config: ConnectorTestConfig = {
  connectorId: 'test-katana-mrp',
  connectorType: 'source',
  engine: 'katana-mrp',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
