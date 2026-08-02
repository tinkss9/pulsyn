// zoho-workspace Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zoho-workspace';

const config: ConnectorTestConfig = {
  connectorId: 'test-zoho-workspace',
  connectorType: 'source',
  engine: 'zoho-workspace',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
