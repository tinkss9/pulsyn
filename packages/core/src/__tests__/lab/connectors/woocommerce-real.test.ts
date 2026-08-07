// WooCommerce REST API v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/woocommerce-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-woocommerce-real',
  connectorType: 'source',
  engine: 'woocommerce-real',
  config: { host: 'https://{store}/wp-json/wc/v3' },
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
