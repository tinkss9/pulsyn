// Microsoft Graph API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/onedrive-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-onedrive-real',
  connectorType: 'source',
  engine: 'onedrive-real',
  config: { host: 'https://graph.microsoft.com/v1.0' },
  testTables: ['files', 'folders', 'permissions'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
