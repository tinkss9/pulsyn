// Open Library Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/openlibrary';

const config: ConnectorTestConfig = {
  connectorId: 'test-openlibrary',
  connectorType: 'source',
  engine: 'openlibrary',
  config: {
    host: 'https://openlibrary.org',
  },
  testTables: ['books', 'authors'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
