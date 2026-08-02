// jira-v3 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/jira-v3';

const config: ConnectorTestConfig = {
  connectorId: 'test-jira-v3',
  connectorType: 'source',
  engine: 'jira-v3',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
