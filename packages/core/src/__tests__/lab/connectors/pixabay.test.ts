// Pixabay — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pixabay';

const config: ConnectorTestConfig = {
  connectorId: 'test-pixabay',
  connectorType: 'source',
  engine: 'pixabay',
  config: {
    host: 'https://pixabay.com/api',
  },
  testTables: ['images'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
