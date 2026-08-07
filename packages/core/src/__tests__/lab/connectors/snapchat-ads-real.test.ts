// Snapchat Ads — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/snapchat-ads-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-snapchat-ads-real',
  connectorType: 'source',
  engine: 'snapchat-ads-real',
  config: { host: 'https://adsapi.snapchat.com/v1' },
  testTables: ['campaigns', 'adSquads', 'ads'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
