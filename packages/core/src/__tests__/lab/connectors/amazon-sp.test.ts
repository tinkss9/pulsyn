// amazon-sp Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/amazon-sp';

const config: ConnectorTestConfig = {
  connectorId: 'test-amazon-sp',
  connectorType: 'source',
  engine: 'amazon-sp',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
