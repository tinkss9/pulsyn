// REST Countries Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/restcountries';

const config: ConnectorTestConfig = {
  connectorId: 'test-restcountries',
  connectorType: 'source',
  engine: 'restcountries',
  config: {
    host: 'https://restcountries.com',
  },
  testTables: ['countries'],
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
