// SharePoint API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sharepoint-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-sharepoint-api',
  connectorType: 'source',
  engine: 'sharepoint-api',
  config: { host: 'https://{tenant}.sharepoint.com/_api' },
  testTables: ['lists'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
