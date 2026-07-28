// Shopify Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/shopify';

const config: ConnectorTestConfig = {
  connectorId: 'test-shopify',
  connectorType: 'source',
  engine: 'shopify',
  config: {
    host: 'shopify.com',
    port: 443,
    database: '',
    username: '',
    password: '',
    shop: process.env.TEST_SHOPIFY_SHOP || '',
    accessToken: process.env.TEST_SHOPIFY_ACCESS_TOKEN || '',
    ssl: true,
  } as any,
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
