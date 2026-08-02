// facebook-ads Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/facebook-ads';

const config: ConnectorTestConfig = {
  connectorId: 'test-facebook-ads',
  connectorType: 'source',
  engine: 'facebook-ads',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
