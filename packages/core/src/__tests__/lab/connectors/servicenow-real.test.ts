// ServiceNow Table API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/servicenow-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-servicenow-real',
  connectorType: 'source',
  engine: 'servicenow-real',
  config: { host: 'https://{instance}.service-now.com/api/now' },
  testTables: ['incident', 'change_request', 'problem'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
