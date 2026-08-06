// Lobsters — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/lobsters';

const config: ConnectorTestConfig = {
  connectorId: 'test-lobsters',
  connectorType: 'source',
  engine: 'lobsters',
  config: { host: 'https://lobste.rs' },
  testTables: ['hottest', 'newest'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
