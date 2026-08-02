// salesforce-gov Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/salesforce-gov';

const config: ConnectorTestConfig = {
  connectorId: 'test-salesforce-gov',
  connectorType: 'source',
  engine: 'salesforce-gov',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
