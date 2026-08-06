// HTTPBin Base64 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/httpbin-base64';

const config: ConnectorTestConfig = {
  connectorId: 'test-httpbin-base64',
  connectorType: 'source',
  engine: 'httpbin-base64',
  config: { host: 'https://httpbin.org' },
  testTables: ['decode'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
