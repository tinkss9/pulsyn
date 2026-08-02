// daily-co Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/daily-co';

const config: ConnectorTestConfig = {
  connectorId: 'test-daily-co',
  connectorType: 'source',
  engine: 'daily-co',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
