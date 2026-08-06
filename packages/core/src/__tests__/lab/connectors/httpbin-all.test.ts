// HTTPBin Full — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/httpbin-all';

const config: ConnectorTestConfig = {
  connectorId: 'test-httpbin-all',
  connectorType: 'source',
  engine: 'httpbin-all',
  config: { host: 'https://httpbin.org' },
  testTables: ['get', 'ip', 'headers', 'user-agent', 'uuid'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
