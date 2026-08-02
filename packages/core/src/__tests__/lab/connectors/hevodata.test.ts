// hevodata Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hevodata';

const config: ConnectorTestConfig = {
  connectorId: 'test-hevodata',
  connectorType: 'source',
  engine: 'hevodata',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
