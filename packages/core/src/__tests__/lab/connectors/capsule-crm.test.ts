// capsule-crm Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/capsule-crm';

const config: ConnectorTestConfig = {
  connectorId: 'test-capsule-crm',
  connectorType: 'source',
  engine: 'capsule-crm',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
