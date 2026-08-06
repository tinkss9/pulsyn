// Anime Chan — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/anime-chan';

const config: ConnectorTestConfig = {
  connectorId: 'test-anime-chan',
  connectorType: 'source',
  engine: 'anime-chan',
  config: { host: 'https://animechan.io/api' },
  testTables: ['quotes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
