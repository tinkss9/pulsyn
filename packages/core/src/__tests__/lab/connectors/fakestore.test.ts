// FakeStore API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/fakestore';

const config: ConnectorTestConfig = {
  connectorId: 'test-fakestore',
  connectorType: 'source',
  engine: 'fakestore',
  config: {
    host: 'https://fakestoreapi.com',
  },
  testTables: ['products', 'users', 'carts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
