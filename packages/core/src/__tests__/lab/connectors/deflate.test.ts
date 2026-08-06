// Deflate Response — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/deflate';

const config: ConnectorTestConfig = {
  connectorId: 'test-deflate',
  connectorType: 'source',
  engine: 'deflate',
  config: { host: 'https://httpbin.org' },
  testTables: ['deflate'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
