// Cache Check — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cache';

const config: ConnectorTestConfig = {
  connectorId: 'test-cache',
  connectorType: 'source',
  engine: 'cache',
  config: { host: 'https://httpbin.org' },
  testTables: ['cache'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
