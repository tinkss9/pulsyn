// Etsy Open API v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/etsy-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-etsy-real',
  connectorType: 'source',
  engine: 'etsy-real',
  config: { host: 'https://openapi.etsy.com/v3' },
  testTables: ['listings', 'shops', 'receipts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
