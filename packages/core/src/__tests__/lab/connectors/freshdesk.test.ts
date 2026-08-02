// freshdesk Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/freshdesk';

const config: ConnectorTestConfig = {
  connectorId: 'test-freshdesk',
  connectorType: 'source',
  engine: 'freshdesk',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
