// QuickBooks API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/quickbooks-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-quickbooks-api',
  connectorType: 'source',
  engine: 'quickbooks-api',
  config: { host: 'https://quickbooks.api.intuit.com/v3' },
  testTables: ['customers'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
