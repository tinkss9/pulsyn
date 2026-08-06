// Salesforce Real Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/salesforce-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-salesforce-real',
  connectorType: 'source',
  engine: 'salesforce-real',
  config: {
    host: 'https://login.salesforce.com',
    // token: '<Salesforce access token from Connected App OAuth2>',
  },
  testTables: ['Account', 'Contact', 'Opportunity'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
