// tiktok-ads Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tiktok-ads';

const config: ConnectorTestConfig = {
  connectorId: 'test-tiktok-ads',
  connectorType: 'source',
  engine: 'tiktok-ads',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
