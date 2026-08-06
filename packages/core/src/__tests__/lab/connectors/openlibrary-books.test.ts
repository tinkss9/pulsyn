// OpenLibrary Books — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/openlibrary-books';

const config: ConnectorTestConfig = {
  connectorId: 'test-openlibrary-books',
  connectorType: 'source',
  engine: 'openlibrary-books',
  config: {
    host: 'https://openlibrary.org',
  },
  testTables: ['trending'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
