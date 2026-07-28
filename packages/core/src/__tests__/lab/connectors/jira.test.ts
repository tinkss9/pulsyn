// Jira Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/jira';

const config: ConnectorTestConfig = {
  connectorId: 'test-jira',
  connectorType: 'source',
  engine: 'jira',
  config: {
    host: process.env.TEST_JIRA_HOST || 'atlassian.net',
    port: 443,
    database: '',
    username: process.env.TEST_JIRA_USER || '',
    password: process.env.TEST_JIRA_API_TOKEN || '',
    ssl: true,
  },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
