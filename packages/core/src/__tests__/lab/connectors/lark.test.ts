// lark Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/lark';

const config: ConnectorTestConfig = {
  connectorId: 'test-lark',
  connectorType: 'source',
  engine: 'lark',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
