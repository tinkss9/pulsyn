// SendGrid API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sendgrid-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-sendgrid-api',
  connectorType: 'source',
  engine: 'sendgrid-api',
  config: { host: 'https://api.sendgrid.com/v3' },
  testTables: ['messages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
