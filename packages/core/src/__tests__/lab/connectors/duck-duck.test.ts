// DuckDuckGo Lite — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/duck-duck';

const config: ConnectorTestConfig = {
  connectorId: 'test-duck-duck',
  connectorType: 'source',
  engine: 'duck-duck',
  config: { host: 'https://lite.duckduckgo.com' },
  testTables: ['search'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
