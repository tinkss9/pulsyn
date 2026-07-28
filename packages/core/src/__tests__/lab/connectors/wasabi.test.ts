// wasabi Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/wasabi';

const config: ConnectorTestConfig = {
  connectorId: 'test-wasabi',
  connectorType: 'source',
  engine: 'wasabi',
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