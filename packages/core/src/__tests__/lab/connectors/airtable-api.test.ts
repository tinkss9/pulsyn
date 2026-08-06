// Airtable API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/airtable-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-airtable-api',
  connectorType: 'source',
  engine: 'airtable-api',
  config: { host: 'https://api.airtable.com/v0' },
  testTables: ['bases'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
