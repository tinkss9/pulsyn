// gitbook Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gitbook';

const config: ConnectorTestConfig = {
  connectorId: 'test-gitbook',
  connectorType: 'source',
  engine: 'gitbook',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
