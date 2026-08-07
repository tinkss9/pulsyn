// LinkedIn API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/linkedin-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-linkedin-real',
  connectorType: 'source',
  engine: 'linkedin-real',
  config: { host: 'https://api.linkedin.com/v2' },
  testTables: ['people', 'organizations', 'posts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
