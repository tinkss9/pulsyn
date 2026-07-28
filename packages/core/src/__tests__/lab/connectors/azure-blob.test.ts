// azure-blob Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/azure-blob';

const config: ConnectorTestConfig = {
  connectorId: 'test-azure-blob',
  connectorType: 'source',
  engine: 'azure-blob',
  config: { host: 'localhost', port: 443, database: 'test-bucket', username: 'test', password: 'test', ssl: true },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();