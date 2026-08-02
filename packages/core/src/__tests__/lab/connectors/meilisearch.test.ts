// meilisearch Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/meilisearch';

const config: ConnectorTestConfig = {
  connectorId: 'test-meilisearch',
  connectorType: 'source',
  engine: 'meilisearch',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
