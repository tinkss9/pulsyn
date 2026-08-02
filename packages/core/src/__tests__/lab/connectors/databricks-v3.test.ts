// databricks-v3 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/databricks-v3';

const config: ConnectorTestConfig = {
  connectorId: 'test-databricks-v3',
  connectorType: 'source',
  engine: 'databricks-v3',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
