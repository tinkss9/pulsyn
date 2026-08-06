// BigCommerce API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bigcommerce-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-bigcommerce-api',
  connectorType: 'source',
  engine: 'bigcommerce-api',
  config: { host: 'https://api.bigcommerce.com/stores/{store_hash}/v3' },
  testTables: ['products'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
