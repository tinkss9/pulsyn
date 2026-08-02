// amazon-ads Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/amazon-ads';

const config: ConnectorTestConfig = {
  connectorId: 'test-amazon-ads',
  connectorType: 'source',
  engine: 'amazon-ads',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
