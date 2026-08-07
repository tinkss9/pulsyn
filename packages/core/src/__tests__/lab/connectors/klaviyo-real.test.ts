// Klaviyo API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/klaviyo-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-klaviyo-real',
  connectorType: 'source',
  engine: 'klaviyo-real',
  config: { host: 'https://a.klaviyo.com/api' },
  testTables: ['profiles', 'lists', 'segments'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
