// Facebook Ads — Comprehensive Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/facebook-ads-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-facebook-ads-real',
  connectorType: 'source',
  engine: 'facebook-ads-real',
  config: { host: 'https://graph.facebook.com/v19.0' },
  testTables: ['campaigns', 'adsets', 'ads'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
