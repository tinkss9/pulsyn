// OpenLibrary Search — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/openlibrary-search';

const config: ConnectorTestConfig = {
  connectorId: 'test-openlibrary-search',
  connectorType: 'source',
  engine: 'openlibrary-search',
  config: {
    host: 'https://openlibrary.org',
  },
  testTables: ['search'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
