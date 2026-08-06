// Stoic Quotes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/stoic-quotes';

const config: ConnectorTestConfig = {
  connectorId: 'test-stoic-quotes',
  connectorType: 'source',
  engine: 'stoic-quotes',
  config: { host: 'https://stoicquotesapi.com/v1/api' },
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
