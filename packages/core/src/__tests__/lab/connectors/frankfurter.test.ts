// frankfurter Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/frankfurter';

const config: ConnectorTestConfig = {
  connectorId: 'test-frankfurter',
  connectorType: 'source',
  engine: 'frankfurter',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
