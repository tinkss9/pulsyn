// Confluence — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/confluence-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-confluence-real',
  connectorType: 'source',
  engine: 'confluence-real',
  config: { host: 'https://{domain}.atlassian.net/wiki/api/v2' },
  testTables: ['pages', 'spaces', 'content'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
