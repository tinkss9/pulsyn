// paylocity-hr Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/paylocity-hr';

const config: ConnectorTestConfig = {
  connectorId: 'test-paylocity-hr',
  connectorType: 'source',
  engine: 'paylocity-hr',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
