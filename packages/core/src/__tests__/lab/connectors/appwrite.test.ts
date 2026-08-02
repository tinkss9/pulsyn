// appwrite Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/appwrite';

const config: ConnectorTestConfig = {
  connectorId: 'test-appwrite',
  connectorType: 'source',
  engine: 'appwrite',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
