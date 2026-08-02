// tokopedia Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tokopedia';

const config: ConnectorTestConfig = {
  connectorId: 'test-tokopedia',
  connectorType: 'source',
  engine: 'tokopedia',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
