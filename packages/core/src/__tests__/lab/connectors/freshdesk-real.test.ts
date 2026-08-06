// Freshdesk — Comprehensive Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/freshdesk-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-freshdesk-real',
  connectorType: 'source',
  engine: 'freshdesk-real',
  config: { host: 'https://{domain}.freshdesk.com/api/v2' },
  testTables: ['tickets', 'contacts', 'agents'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
