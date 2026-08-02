// paylocity Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/paylocity';

const config: ConnectorTestConfig = {
  connectorId: 'test-paylocity',
  connectorType: 'source',
  engine: 'paylocity',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
