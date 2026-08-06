// Lobsters Newest — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/lobsters-newest';

const config: ConnectorTestConfig = {
  connectorId: 'test-lobsters-newest',
  connectorType: 'source',
  engine: 'lobsters-newest',
  config: { host: 'https://lobste.rs' },
  testTables: ['stories'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
