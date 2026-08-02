// google-workspace Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/google-workspace';

const config: ConnectorTestConfig = {
  connectorId: 'test-google-workspace',
  connectorType: 'source',
  engine: 'google-workspace',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
