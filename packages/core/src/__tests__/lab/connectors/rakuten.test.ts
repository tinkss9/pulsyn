// rakuten Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/rakuten';

const config: ConnectorTestConfig = {
  connectorId: 'test-rakuten',
  connectorType: 'source',
  engine: 'rakuten',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
