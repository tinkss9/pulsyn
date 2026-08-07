// SugarCRM REST API v11 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sugarcrm-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-sugarcrm-real',
  connectorType: 'source',
  engine: 'sugarcrm-real',
  config: { host: 'https://{instance}.sugarondemand.com/rest/v11' },
  testTables: ['Contacts', 'Accounts', 'Opportunities'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
