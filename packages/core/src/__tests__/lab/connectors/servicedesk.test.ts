// servicedesk Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/servicedesk';

const config: ConnectorTestConfig = {
  connectorId: 'test-servicedesk',
  connectorType: 'source',
  engine: 'servicedesk',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
