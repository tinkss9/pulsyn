// Encoding UTF8 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/encoding';

const config: ConnectorTestConfig = {
  connectorId: 'test-encoding',
  connectorType: 'source',
  engine: 'encoding',
  config: { host: 'https://httpbin.org' },
  testTables: ['encoding'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
