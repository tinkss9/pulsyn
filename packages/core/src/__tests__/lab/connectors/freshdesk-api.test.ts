// Freshdesk API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/freshdesk-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-freshdesk-api',
  connectorType: 'source',
  engine: 'freshdesk-api',
  config: { host: 'https://{domain}.freshdesk.com/api/v2' },
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
