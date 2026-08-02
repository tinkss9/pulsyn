// sfdc-marketing Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sfdc-marketing';

const config: ConnectorTestConfig = {
  connectorId: 'test-sfdc-marketing',
  connectorType: 'source',
  engine: 'sfdc-marketing',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
