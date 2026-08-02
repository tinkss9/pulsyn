// neon-serverless Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/neon-serverless';

const config: ConnectorTestConfig = {
  connectorId: 'test-neon-serverless',
  connectorType: 'source',
  engine: 'neon-serverless',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
