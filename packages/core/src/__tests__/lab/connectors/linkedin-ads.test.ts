// LinkedIn Ads — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/linkedin-ads';

const config: ConnectorTestConfig = {
  connectorId: 'test-linkedin-ads',
  connectorType: 'source',
  engine: 'linkedin-ads',
  config: { host: 'https://api.linkedin.com/v2' },
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
