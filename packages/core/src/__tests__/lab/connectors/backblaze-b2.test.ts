// backblaze-b2 Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/backblaze-b2';

const config: ConnectorTestConfig = {
  connectorId: 'test-backblaze-b2',
  connectorType: 'source',
  engine: 'backblaze-b2',
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