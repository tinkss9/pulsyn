// azure-blob Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/azure-blob';

const config: ConnectorTestConfig = {
  connectorId: 'test-azure-blob',
  connectorType: 'source',
  engine: 'azure-blob',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
