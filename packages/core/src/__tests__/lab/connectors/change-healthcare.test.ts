// change-healthcare Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/change-healthcare';

const config: ConnectorTestConfig = {
  connectorId: 'test-change-healthcare',
  connectorType: 'source',
  engine: 'change-healthcare',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
