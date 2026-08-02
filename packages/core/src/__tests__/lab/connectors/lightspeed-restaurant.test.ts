// lightspeed-restaurant Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/lightspeed-restaurant';

const config: ConnectorTestConfig = {
  connectorId: 'test-lightspeed-restaurant',
  connectorType: 'source',
  engine: 'lightspeed-restaurant',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
