// randomfox Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/randomfox';

const config: ConnectorTestConfig = {
  connectorId: 'test-randomfox',
  connectorType: 'source',
  engine: 'randomfox',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
