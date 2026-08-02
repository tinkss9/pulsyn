// nagerdate Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nagerdate';

const config: ConnectorTestConfig = {
  connectorId: 'test-nagerdate',
  connectorType: 'source',
  engine: 'nagerdate',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
