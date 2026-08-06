// mailchimp-real — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mailchimp-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-mailchimp-real',
  connectorType: 'source',
  engine: 'mailchimp-real',
  config: { host: 'https://api.example.com' },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();

