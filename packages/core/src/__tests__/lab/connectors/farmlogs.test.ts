// farmlogs Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/farmlogs';

const config: ConnectorTestConfig = {
  connectorId: 'test-farmlogs',
  connectorType: 'source',
  engine: 'farmlogs',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
