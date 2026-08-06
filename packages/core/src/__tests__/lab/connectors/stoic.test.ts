// Stoic Quotes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/stoic';

const config: ConnectorTestConfig = {
  connectorId: 'test-stoic',
  connectorType: 'source',
  engine: 'stoic',
  config: {
    host: 'https://stoic-quotes.com/api',
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
