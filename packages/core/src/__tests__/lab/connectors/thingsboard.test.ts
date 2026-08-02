// thingsboard Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/thingsboard';

const config: ConnectorTestConfig = {
  connectorId: 'test-thingsboard',
  connectorType: 'source',
  engine: 'thingsboard',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
