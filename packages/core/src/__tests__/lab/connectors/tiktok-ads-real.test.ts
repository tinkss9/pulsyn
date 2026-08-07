// TikTok Ads — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tiktok-ads-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-tiktok-ads-real',
  connectorType: 'source',
  engine: 'tiktok-ads-real',
  config: { host: 'https://business-api.tiktok.com/open_api/v1.3' },
  testTables: ['campaigns', 'adGroups', 'ads'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
