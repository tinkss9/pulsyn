// Zen Quotes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zenquotes';

const config: ConnectorTestConfig = {
  connectorId: 'test-zenquotes',
  connectorType: 'source',
  engine: 'zenquotes',
  config: {
    host: 'https://zenquotes.io/api',
  },
  testTables: ['quotes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
