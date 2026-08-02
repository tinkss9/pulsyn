// obsidian Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/obsidian';

const config: ConnectorTestConfig = {
  connectorId: 'test-obsidian',
  connectorType: 'source',
  engine: 'obsidian',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
