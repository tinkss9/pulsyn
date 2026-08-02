// greenplum Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/greenplum';

const config: ConnectorTestConfig = {
  connectorId: 'test-greenplum',
  connectorType: 'source',
  engine: 'greenplum',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
