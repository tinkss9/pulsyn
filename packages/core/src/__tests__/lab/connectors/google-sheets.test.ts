// google-sheets Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/google-sheets';

const config: ConnectorTestConfig = {
  connectorId: 'test-google-sheets',
  connectorType: 'source',
  engine: 'google-sheets',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
