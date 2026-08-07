// BigCommerce API v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bigcommerce-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-bigcommerce-real',
  connectorType: 'source',
  engine: 'bigcommerce-real',
  config: { host: 'https://api.bigcommerce.com/stores/{store_hash}/v3' },
  testTables: ['products', 'orders', 'customers'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
