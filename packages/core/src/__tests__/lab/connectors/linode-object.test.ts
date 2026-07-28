// linode-object Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/linode-object';

const config: ConnectorTestConfig = {
  connectorId: 'test-linode-object',
  connectorType: 'source',
  engine: 'linode-object',
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