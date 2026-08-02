// jsonplaceholder2 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/jsonplaceholder2';

const config: ConnectorTestConfig = {
  connectorId: 'test-jsonplaceholder2',
  connectorType: 'source',
  engine: 'jsonplaceholder2',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
