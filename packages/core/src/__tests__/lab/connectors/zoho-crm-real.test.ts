// Zoho CRM API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zoho-crm-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-zoho-crm-real',
  connectorType: 'source',
  engine: 'zoho-crm-real',
  config: { host: 'https://www.zohoapis.com/crm/v2' },
  testTables: ['Contacts', 'Accounts', 'Deals'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
