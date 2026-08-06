// DummyJSON — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dummyjson';

const config: ConnectorTestConfig = {
  connectorId: 'test-dummyjson',
  connectorType: 'source',
  engine: 'dummyjson',
  config: {
    host: 'https://dummyjson.com',
  },
  testTables: ['products', 'users', 'todos'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
