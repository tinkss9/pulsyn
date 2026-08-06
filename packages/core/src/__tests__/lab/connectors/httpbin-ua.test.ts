// HTTPBin UA — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/httpbin-ua';

const config: ConnectorTestConfig = {
  connectorId: 'test-httpbin-ua',
  connectorType: 'source',
  engine: 'httpbin-ua',
  config: { host: 'https://httpbin.org' },
  testTables: ['ua'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
