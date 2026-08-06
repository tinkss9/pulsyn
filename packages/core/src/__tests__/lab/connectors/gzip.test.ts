// GZip Response — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gzip';

const config: ConnectorTestConfig = {
  connectorId: 'test-gzip',
  connectorType: 'source',
  engine: 'gzip',
  config: { host: 'https://httpbin.org' },
  testTables: ['gzip'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
