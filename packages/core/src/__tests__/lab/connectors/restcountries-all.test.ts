// RestCountries All — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/restcountries-all';

const config: ConnectorTestConfig = {
  connectorId: 'test-restcountries-all',
  connectorType: 'source',
  engine: 'restcountries-all',
  config: { host: 'https://restcountries.com/v3.1' },
  testTables: ['all'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
