// FakeStore v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/fakestore-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-fakestore-v2',
  connectorType: 'source',
  engine: 'fakestore-v2',
  config: { host: 'https://fakestoreapi.com' },
  testTables: ['products', 'carts', 'users'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
