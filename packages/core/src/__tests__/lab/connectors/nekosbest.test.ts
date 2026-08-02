// nekosbest Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nekosbest';

const config: ConnectorTestConfig = {
  connectorId: 'test-nekosbest',
  connectorType: 'source',
  engine: 'nekosbest',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
