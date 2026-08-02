// sqlserver Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sqlserver';

const config: ConnectorTestConfig = {
  connectorId: 'test-sqlserver',
  connectorType: 'source',
  engine: 'sqlserver',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
