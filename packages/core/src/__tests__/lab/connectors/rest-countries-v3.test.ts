// RestCountries v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/rest-countries-v3';

const config: ConnectorTestConfig = {
  connectorId: 'test-rest-countries-v3',
  connectorType: 'source',
  engine: 'rest-countries-v3',
  config: { host: 'https://restcountries.com/v3.1' },
  testTables: ['all', 'fields'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
