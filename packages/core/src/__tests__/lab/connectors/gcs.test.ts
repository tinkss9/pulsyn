// gcs Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gcs';

const config: ConnectorTestConfig = {
  connectorId: 'test-gcs',
  connectorType: 'source',
  engine: 'gcs',
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