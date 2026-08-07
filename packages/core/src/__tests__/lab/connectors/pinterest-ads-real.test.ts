// Pinterest Ads — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pinterest-ads-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-pinterest-ads-real',
  connectorType: 'source',
  engine: 'pinterest-ads-real',
  config: { host: 'https://api.pinterest.com/v5' },
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
