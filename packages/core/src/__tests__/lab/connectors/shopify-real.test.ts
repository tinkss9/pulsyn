// Shopify Real Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/shopify-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-shopify-real',
  connectorType: 'source',
  engine: 'shopify-real',
  config: {
    host: 'mystore.myshopify.com',
    // token: '<Shopify Admin API access token shpat_*>',
  },
  testTables: ['products', 'orders', 'customers'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
