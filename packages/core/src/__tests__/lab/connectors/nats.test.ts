// nats Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nats';

const config: ConnectorTestConfig = {
  connectorId: 'test-nats',
  connectorType: 'source',
  engine: 'nats',
  config: { host: process.env.TEST_NATS_HOST || 'localhost', port: 5672, database: '', username: '', password: '' },
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