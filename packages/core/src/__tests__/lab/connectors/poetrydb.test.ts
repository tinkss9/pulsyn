// poetrydb Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/poetrydb';

const config: ConnectorTestConfig = {
  connectorId: 'test-poetrydb',
  connectorType: 'source',
  engine: 'poetrydb',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
