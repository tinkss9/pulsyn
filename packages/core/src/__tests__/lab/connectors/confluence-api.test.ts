// Confluence API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/confluence-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-confluence-api',
  connectorType: 'source',
  engine: 'confluence-api',
  config: { host: 'https://{domain}.atlassian.net/wiki/rest/api' },
  testTables: ['pages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
