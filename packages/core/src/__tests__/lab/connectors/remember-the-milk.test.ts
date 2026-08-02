// remember-the-milk Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/remember-the-milk';

const config: ConnectorTestConfig = {
  connectorId: 'test-remember-the-milk',
  connectorType: 'source',
  engine: 'remember-the-milk',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
