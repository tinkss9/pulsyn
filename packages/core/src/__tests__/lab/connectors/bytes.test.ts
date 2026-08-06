// Random Bytes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bytes';

const config: ConnectorTestConfig = {
  connectorId: 'test-bytes',
  connectorType: 'source',
  engine: 'bytes',
  config: { host: 'https://httpbin.org' },
  testTables: ['bytes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
