// HTTPBin v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/httpbin2';

const config: ConnectorTestConfig = {
  connectorId: 'test-httpbin2',
  connectorType: 'source',
  engine: 'httpbin2',
  config: {
    host: 'https://httpbin.org',
  },
  testTables: ['get', 'uuid'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
