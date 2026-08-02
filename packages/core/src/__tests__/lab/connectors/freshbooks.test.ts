// freshbooks Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/freshbooks';

const config: ConnectorTestConfig = {
  connectorId: 'test-freshbooks',
  connectorType: 'source',
  engine: 'freshbooks',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
