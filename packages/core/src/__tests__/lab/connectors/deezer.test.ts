// Deezer API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/deezer';

const config: ConnectorTestConfig = {
  connectorId: 'test-deezer',
  connectorType: 'source',
  engine: 'deezer',
  config: {
    host: 'https://api.deezer.com',
  },
  testTables: ['chart', 'genres'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
