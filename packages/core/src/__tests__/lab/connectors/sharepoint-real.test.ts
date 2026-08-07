// SharePoint REST API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sharepoint-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-sharepoint-real',
  connectorType: 'source',
  engine: 'sharepoint-real',
  config: { host: 'https://{tenant}.sharepoint.com/_api' },
  testTables: ['lists', 'items', 'files'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
