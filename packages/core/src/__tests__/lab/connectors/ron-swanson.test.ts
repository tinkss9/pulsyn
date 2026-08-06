// Ron Swanson Quotes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ron-swanson';

const config: ConnectorTestConfig = {
  connectorId: 'test-ron-swanson',
  connectorType: 'source',
  engine: 'ron-swanson',
  config: { host: 'https://ron-swanson-quotes.herokuapp.com/v2' },
  testTables: ['quotes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
