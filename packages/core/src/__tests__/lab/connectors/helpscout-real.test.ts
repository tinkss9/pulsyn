// Help Scout API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/helpscout-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-helpscout-real',
  connectorType: 'source',
  engine: 'helpscout-real',
  config: { host: 'https://api.helpscout.net/v2' },
  testTables: ['conversations', 'customers', 'mailboxes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
