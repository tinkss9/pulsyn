// zoho-books Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zoho-books';

const config: ConnectorTestConfig = {
  connectorId: 'test-zoho-books',
  connectorType: 'source',
  engine: 'zoho-books',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
