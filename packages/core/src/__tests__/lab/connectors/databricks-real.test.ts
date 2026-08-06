// databricks-real — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/databricks-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-databricks-real',
  connectorType: 'source',
  engine: 'databricks-real',
  config: { host: 'https://api.example.com' },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();

