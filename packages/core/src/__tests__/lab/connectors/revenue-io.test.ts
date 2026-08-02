// revenue-io Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/revenue-io';

const config: ConnectorTestConfig = {
  connectorId: 'test-revenue-io',
  connectorType: 'source',
  engine: 'revenue-io',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
