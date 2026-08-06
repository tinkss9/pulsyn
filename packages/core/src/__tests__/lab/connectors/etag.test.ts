// ETag Check — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/etag';

const config: ConnectorTestConfig = {
  connectorId: 'test-etag',
  connectorType: 'source',
  engine: 'etag',
  config: { host: 'https://httpbin.org' },
  testTables: ['etag'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
