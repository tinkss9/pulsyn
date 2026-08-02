// reddit-ads Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/reddit-ads';

const config: ConnectorTestConfig = {
  connectorId: 'test-reddit-ads',
  connectorType: 'source',
  engine: 'reddit-ads',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
