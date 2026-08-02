// cloudbeds Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cloudbeds';

const config: ConnectorTestConfig = {
  connectorId: 'test-cloudbeds',
  connectorType: 'source',
  engine: 'cloudbeds',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
