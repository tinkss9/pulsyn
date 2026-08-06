// HTTPBin UUID — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/httpbin-uuid';

const config: ConnectorTestConfig = {
  connectorId: 'test-httpbin-uuid',
  connectorType: 'source',
  engine: 'httpbin-uuid',
  config: { host: 'https://httpbin.org' },
  testTables: ['uuid'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
