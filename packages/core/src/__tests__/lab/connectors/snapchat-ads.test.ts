// snapchat-ads Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/snapchat-ads';

const config: ConnectorTestConfig = {
  connectorId: 'test-snapchat-ads',
  connectorType: 'source',
  engine: 'snapchat-ads',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
