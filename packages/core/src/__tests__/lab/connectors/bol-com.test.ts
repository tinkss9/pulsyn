// bol-com Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bol-com';

const config: ConnectorTestConfig = {
  connectorId: 'test-bol-com',
  connectorType: 'source',
  engine: 'bol-com',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
