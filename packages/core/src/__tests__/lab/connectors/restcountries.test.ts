// RestCountries — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/restcountries';

const config: ConnectorTestConfig = {
  connectorId: 'test-restcountries',
  connectorType: 'source',
  engine: 'restcountries',
  config: {
    host: 'https://restcountries.com/v3.1',
  },
  testTables: ['countries'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
