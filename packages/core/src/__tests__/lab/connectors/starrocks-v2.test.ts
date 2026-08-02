// starrocks-v2 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/starrocks-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-starrocks-v2',
  connectorType: 'source',
  engine: 'starrocks-v2',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
