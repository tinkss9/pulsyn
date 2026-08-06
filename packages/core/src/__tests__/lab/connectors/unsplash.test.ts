// Unsplash — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/unsplash';

const config: ConnectorTestConfig = {
  connectorId: 'test-unsplash',
  connectorType: 'source',
  engine: 'unsplash',
  config: {
    host: 'https://api.unsplash.com',
  },
  testTables: ['photos'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
