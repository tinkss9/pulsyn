// Stoic Quotes v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/stoic2';

const config: ConnectorTestConfig = {
  connectorId: 'test-stoic2',
  connectorType: 'source',
  engine: 'stoic2',
  config: { host: 'https://stoicquotesapi.com/v1/api' },
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
