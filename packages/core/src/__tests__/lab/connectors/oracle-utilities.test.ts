// oracle-utilities Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/oracle-utilities';

const config: ConnectorTestConfig = {
  connectorId: 'test-oracle-utilities',
  connectorType: 'source',
  engine: 'oracle-utilities',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
