// zoho-desk Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zoho-desk';

const config: ConnectorTestConfig = {
  connectorId: 'test-zoho-desk',
  connectorType: 'source',
  engine: 'zoho-desk',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
