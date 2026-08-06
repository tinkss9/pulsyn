// Ron Swanson Quotes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ronswanson';

const config: ConnectorTestConfig = {
  connectorId: 'test-ronswanson',
  connectorType: 'source',
  engine: 'ronswanson',
  config: {
    host: 'https://ron-swanson-quotes.herokuapp.com/v2',
  },
  testTables: ['quotes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
