// pulsar Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pulsar';

const config: ConnectorTestConfig = {
  connectorId: 'test-pulsar',
  connectorType: 'source',
  engine: 'pulsar',
  config: { host: process.env.TEST_PULSAR_HOST || 'localhost', port: 5672, database: '', username: '', password: '' },
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