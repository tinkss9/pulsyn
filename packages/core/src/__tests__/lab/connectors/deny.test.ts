// Deny Page — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/deny';

const config: ConnectorTestConfig = {
  connectorId: 'test-deny',
  connectorType: 'source',
  engine: 'deny',
  config: { host: 'https://httpbin.org' },
  testTables: ['deny'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
