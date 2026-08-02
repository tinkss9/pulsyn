// hygraph Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hygraph';

const config: ConnectorTestConfig = {
  connectorId: 'test-hygraph',
  connectorType: 'source',
  engine: 'hygraph',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
