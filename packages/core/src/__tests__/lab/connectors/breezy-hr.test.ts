// breezy-hr Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/breezy-hr';

const config: ConnectorTestConfig = {
  connectorId: 'test-breezy-hr',
  connectorType: 'source',
  engine: 'breezy-hr',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
