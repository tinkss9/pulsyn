// httpbin Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/httpbin';

const config: ConnectorTestConfig = {
  connectorId: 'test-httpbin',
  connectorType: 'source',
  engine: 'httpbin',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
