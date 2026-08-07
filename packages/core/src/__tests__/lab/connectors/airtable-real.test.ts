// Airtable — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/airtable-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-airtable-real',
  connectorType: 'source',
  engine: 'airtable-real',
  config: { host: 'https://api.airtable.com/v0' },
  testTables: ['bases', 'tables', 'records'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
