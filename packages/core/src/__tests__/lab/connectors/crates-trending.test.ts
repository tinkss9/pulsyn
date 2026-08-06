// Crates.io Trending — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/crates-trending';

const config: ConnectorTestConfig = {
  connectorId: 'test-crates-trending',
  connectorType: 'source',
  engine: 'crates-trending',
  config: { host: 'https://crates.io/api/v1' },
  testTables: ['crates'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
