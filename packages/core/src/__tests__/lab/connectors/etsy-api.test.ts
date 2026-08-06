// Etsy API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/etsy-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-etsy-api',
  connectorType: 'source',
  engine: 'etsy-api',
  config: { host: 'https://openapi.etsy.com/v3' },
  testTables: ['listings'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
