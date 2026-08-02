// zoho-crm Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zoho-crm';

const config: ConnectorTestConfig = {
  connectorId: 'test-zoho-crm',
  connectorType: 'source',
  engine: 'zoho-crm',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
