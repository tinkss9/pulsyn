// HTTPBin Headers — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/httpbin-headers';

const config: ConnectorTestConfig = {
  connectorId: 'test-httpbin-headers',
  connectorType: 'source',
  engine: 'httpbin-headers',
  config: { host: 'https://httpbin.org' },
  testTables: ['headers'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
