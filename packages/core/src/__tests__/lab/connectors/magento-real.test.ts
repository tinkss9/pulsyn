// Magento REST API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/magento-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-magento-real',
  connectorType: 'source',
  engine: 'magento-real',
  config: { host: 'https://{store}/rest/V1' },
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
