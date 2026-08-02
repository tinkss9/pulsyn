// elastic-email Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/elastic-email';

const config: ConnectorTestConfig = {
  connectorId: 'test-elastic-email',
  connectorType: 'source',
  engine: 'elastic-email',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
