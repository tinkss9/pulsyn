// zeplin Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zeplin';

const config: ConnectorTestConfig = {
  connectorId: 'test-zeplin',
  connectorType: 'source',
  engine: 'zeplin',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
