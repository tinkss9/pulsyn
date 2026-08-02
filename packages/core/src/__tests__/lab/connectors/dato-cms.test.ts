// dato-cms Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dato-cms';

const config: ConnectorTestConfig = {
  connectorId: 'test-dato-cms',
  connectorType: 'source',
  engine: 'dato-cms',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
