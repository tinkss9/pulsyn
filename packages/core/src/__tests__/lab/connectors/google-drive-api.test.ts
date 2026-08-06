// Google Drive API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/google-drive-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-google-drive-api',
  connectorType: 'source',
  engine: 'google-drive-api',
  config: { host: 'https://www.googleapis.com/drive/v3' },
  testTables: ['files'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
