// paycom-hr Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/paycom-hr';

const config: ConnectorTestConfig = {
  connectorId: 'test-paycom-hr',
  connectorType: 'source',
  engine: 'paycom-hr',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
