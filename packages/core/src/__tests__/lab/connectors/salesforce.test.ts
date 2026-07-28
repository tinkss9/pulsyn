// Salesforce Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/salesforce';

const config: ConnectorTestConfig = {
  connectorId: 'test-salesforce',
  connectorType: 'source',
  engine: 'salesforce',
  config: {
    host: process.env.TEST_SALESFORCE_HOST || 'login.salesforce.com',
    port: 443,
    database: process.env.TEST_SALESFORCE_DB || '',
    username: process.env.TEST_SALESFORCE_USER || '',
    password: process.env.TEST_SALESFORCE_PASS || '',
    instanceUrl: process.env.TEST_SALESFORCE_INSTANCE || 'https://login.salesforce.com',
    clientId: process.env.TEST_SALESFORCE_CLIENT_ID || '',
    clientSecret: process.env.TEST_SALESFORCE_CLIENT_SECRET || '',
    refreshToken: process.env.TEST_SALESFORCE_REFRESH_TOKEN || '',
    ssl: true,
  } as any,
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
