// cal-com Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cal-com';

const config: ConnectorTestConfig = {
  connectorId: 'test-cal-com',
  connectorType: 'source',
  engine: 'cal-com',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
