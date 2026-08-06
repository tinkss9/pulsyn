// Pirate Ipsum — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pirateipsum';

const config: ConnectorTestConfig = {
  connectorId: 'test-pirateipsum',
  connectorType: 'source',
  engine: 'pirateipsum',
  config: { host: 'https://pirateipsum.com' },
  testTables: ['text'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
