// openholidays Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/openholidays';

const config: ConnectorTestConfig = {
  connectorId: 'test-openholidays',
  connectorType: 'source',
  engine: 'openholidays',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
