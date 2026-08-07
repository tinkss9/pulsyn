// Dropbox API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dropbox-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-dropbox-real',
  connectorType: 'source',
  engine: 'dropbox-real',
  config: { host: 'https://api.dropboxapi.com/2' },
  testTables: ['files', 'folders', 'sharing'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
