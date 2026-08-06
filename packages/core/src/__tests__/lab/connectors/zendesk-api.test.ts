// Zendesk API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zendesk-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-zendesk-api',
  connectorType: 'source',
  engine: 'zendesk-api',
  config: { host: 'https://{subdomain}.zendesk.com/api/v2' },
  testTables: ['tickets'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
