// cleverbridge Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cleverbridge';

const config: ConnectorTestConfig = {
  connectorId: 'test-cleverbridge',
  connectorType: 'source',
  engine: 'cleverbridge',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
