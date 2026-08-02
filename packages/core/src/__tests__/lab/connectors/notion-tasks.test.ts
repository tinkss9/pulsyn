// notion-tasks Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/notion-tasks';

const config: ConnectorTestConfig = {
  connectorId: 'test-notion-tasks',
  connectorType: 'source',
  engine: 'notion-tasks',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
