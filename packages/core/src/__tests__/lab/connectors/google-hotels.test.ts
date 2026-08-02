// google-hotels Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/google-hotels';

const config: ConnectorTestConfig = {
  connectorId: 'test-google-hotels',
  connectorType: 'source',
  engine: 'google-hotels',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
