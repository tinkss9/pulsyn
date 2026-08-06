// DummyJSON Products — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dummyjson-products';

const config: ConnectorTestConfig = {
  connectorId: 'test-dummyjson-products',
  connectorType: 'source',
  engine: 'dummyjson-products',
  config: { host: 'https://dummyjson.com' },
  testTables: ['products', 'users', 'todos', 'posts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
