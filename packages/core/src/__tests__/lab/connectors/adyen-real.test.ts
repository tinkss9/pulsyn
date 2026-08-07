// Adyen API v68 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/adyen-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-adyen-real',
  connectorType: 'source',
  engine: 'adyen-real',
  config: { host: 'https://pal-test.adyen.com/pal/servlet/Payment/v68' },
  testTables: ['payments', 'refunds', 'payouts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
