// citus-v2 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/citus-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-citus-v2',
  connectorType: 'source',
  engine: 'citus-v2',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
