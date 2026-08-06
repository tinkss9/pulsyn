// WooCommerce API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/woocommerce-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-woocommerce-api',
  connectorType: 'source',
  engine: 'woocommerce-api',
  config: { host: 'https://{store}/wp-json/wc/v3' },
  testTables: ['products', 'orders'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
