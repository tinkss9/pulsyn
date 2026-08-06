// ZenQuotes Random — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zenquotes-random';

const config: ConnectorTestConfig = {
  connectorId: 'test-zenquotes-random',
  connectorType: 'source',
  engine: 'zenquotes-random',
  config: { host: 'https://zenquotes.io/api' },
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
