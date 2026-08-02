// chrome-river Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/chrome-river';

const config: ConnectorTestConfig = {
  connectorId: 'test-chrome-river',
  connectorType: 'source',
  engine: 'chrome-river',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
