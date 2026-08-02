// recruitee Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/recruitee';

const config: ConnectorTestConfig = {
  connectorId: 'test-recruitee',
  connectorType: 'source',
  engine: 'recruitee',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
