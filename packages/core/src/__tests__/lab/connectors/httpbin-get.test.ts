// HTTPBin GET — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/httpbin-get';

const config: ConnectorTestConfig = {
  connectorId: 'test-httpbin-get',
  connectorType: 'source',
  engine: 'httpbin-get',
  config: { host: 'https://httpbin.org' },
  testTables: ['get'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
