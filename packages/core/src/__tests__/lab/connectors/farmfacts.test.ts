// farmfacts Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/farmfacts';

const config: ConnectorTestConfig = {
  connectorId: 'test-farmfacts',
  connectorType: 'source',
  engine: 'farmfacts',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
