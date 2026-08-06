// OMDB Search — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/omdb-search';

const config: ConnectorTestConfig = {
  connectorId: 'test-omdb-search',
  connectorType: 'source',
  engine: 'omdb-search',
  config: { host: 'https://www.omdbapi.com' },
  testTables: ['search'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
