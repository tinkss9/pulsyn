// orientdb Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/orientdb';

const config: ConnectorTestConfig = {
  connectorId: 'test-orientdb',
  connectorType: 'source',
  engine: 'orientdb',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
