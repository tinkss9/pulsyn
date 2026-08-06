// HTTPBin API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/httpbin-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-httpbin-api',
  connectorType: 'source',
  engine: 'httpbin-api',
  config: {
    host: 'https://httpbin.org',
  },
  testTables: ['ip', 'headers', 'user_agent'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
