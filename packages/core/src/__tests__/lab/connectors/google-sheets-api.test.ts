// Google Sheets API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/google-sheets-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-google-sheets-api',
  connectorType: 'source',
  engine: 'google-sheets-api',
  config: { host: 'https://sheets.googleapis.com/v4' },
  testTables: ['sheets'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
