// JSON Page — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/json';

const config: ConnectorTestConfig = {
  connectorId: 'test-json',
  connectorType: 'source',
  engine: 'json',
  config: { host: 'https://httpbin.org' },
  testTables: ['json'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
