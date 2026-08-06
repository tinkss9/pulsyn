// Dropbox API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dropbox-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-dropbox-api',
  connectorType: 'source',
  engine: 'dropbox-api',
  config: { host: 'https://api.dropboxapi.com/2' },
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
