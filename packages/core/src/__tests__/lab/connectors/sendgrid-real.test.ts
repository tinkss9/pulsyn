// SendGrid API v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sendgrid-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-sendgrid-real',
  connectorType: 'source',
  engine: 'sendgrid-real',
  config: { host: 'https://api.sendgrid.com/v3' },
  testTables: ['messages', 'contacts', 'lists'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
