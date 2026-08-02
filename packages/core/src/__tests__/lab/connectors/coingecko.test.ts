// coingecko Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/coingecko';

const config: ConnectorTestConfig = {
  connectorId: 'test-coingecko',
  connectorType: 'source',
  engine: 'coingecko',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
