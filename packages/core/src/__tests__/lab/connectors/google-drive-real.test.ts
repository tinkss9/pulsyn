// Google Drive API v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/google-drive-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-google-drive-real',
  connectorType: 'source',
  engine: 'google-drive-real',
  config: { host: 'https://www.googleapis.com/drive/v3' },
  testTables: ['files', 'revisions', 'permissions'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
