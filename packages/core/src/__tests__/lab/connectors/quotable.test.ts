// Quotable — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/quotable';

const config: ConnectorTestConfig = {
  connectorId: 'test-quotable',
  connectorType: 'source',
  engine: 'quotable',
  config: {
    host: 'https://api.quotable.io',
  },
  testTables: ['quotes', 'authors'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
