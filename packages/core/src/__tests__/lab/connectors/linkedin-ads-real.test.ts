// LinkedIn Ads — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/linkedin-ads-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-linkedin-ads-real',
  connectorType: 'source',
  engine: 'linkedin-ads-real',
  config: { host: 'https://api.linkedin.com/v2' },
  testTables: ['campaigns', 'adAccounts', 'creatives'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
