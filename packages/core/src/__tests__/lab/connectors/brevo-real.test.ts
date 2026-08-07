// Brevo API v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/brevo-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-brevo-real',
  connectorType: 'source',
  engine: 'brevo-real',
  config: { host: 'https://api.brevo.com/v3' },
  testTables: ['contacts', 'lists', 'campaigns'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
