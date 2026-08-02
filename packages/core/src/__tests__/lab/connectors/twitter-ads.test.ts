// twitter-ads Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/twitter-ads';

const config: ConnectorTestConfig = {
  connectorId: 'test-twitter-ads',
  connectorType: 'source',
  engine: 'twitter-ads',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
