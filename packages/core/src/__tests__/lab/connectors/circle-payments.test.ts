// circle-payments Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/circle-payments';

const config: ConnectorTestConfig = {
  connectorId: 'test-circle-payments',
  connectorType: 'source',
  engine: 'circle-payments',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
