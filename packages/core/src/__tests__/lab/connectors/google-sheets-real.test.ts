// Google Sheets — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/google-sheets-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-google-sheets-real',
  connectorType: 'source',
  engine: 'google-sheets-real',
  config: { host: 'https://sheets.googleapis.com/v4' },
  testTables: ['spreadsheets', 'sheets', 'values'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
