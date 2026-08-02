// tidb-cloud Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tidb-cloud';

const config: ConnectorTestConfig = {
  connectorId: 'test-tidb-cloud',
  connectorType: 'source',
  engine: 'tidb-cloud',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
