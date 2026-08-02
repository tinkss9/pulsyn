// wix-ecom Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/wix-ecom';

const config: ConnectorTestConfig = {
  connectorId: 'test-wix-ecom',
  connectorType: 'source',
  engine: 'wix-ecom',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
