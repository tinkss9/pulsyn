// wordpress Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/wordpress';

const config: ConnectorTestConfig = {
  connectorId: 'test-wordpress',
  connectorType: 'source',
  engine: 'wordpress',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
