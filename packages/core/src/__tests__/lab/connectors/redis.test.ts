// Redis Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/redis';

const config: ConnectorTestConfig = {
  connectorId: 'test-redis',
  connectorType: 'source',
  engine: 'redis',
  config: {
    host: process.env.TEST_REDIS_HOST || 'localhost',
    port: parseInt(process.env.TEST_REDIS_PORT || '6379'),
  },
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
  maxConnectionLatencyMs: 2000,
  minExtractThroughput: 5000,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
