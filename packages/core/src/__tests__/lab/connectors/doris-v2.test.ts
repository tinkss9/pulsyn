// doris-v2 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/doris-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-doris-v2',
  connectorType: 'source',
  engine: 'doris-v2',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
