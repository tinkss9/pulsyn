// monday-crm Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/monday-crm';

const config: ConnectorTestConfig = {
  connectorId: 'test-monday-crm',
  connectorType: 'source',
  engine: 'monday-crm',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
