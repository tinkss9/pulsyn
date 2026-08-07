// Microsoft Graph API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/microsoft-teams-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-microsoft-teams-real',
  connectorType: 'source',
  engine: 'microsoft-teams-real',
  config: { host: 'https://graph.microsoft.com/v1.0' },
  testTables: ['teams', 'channels', 'messages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
