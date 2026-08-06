// Google Ads API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/google-ads-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-google-ads-api',
  connectorType: 'source',
  engine: 'google-ads-api',
  config: { host: 'https://googleads.googleapis.com/v15' },
  testTables: ['campaigns'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
