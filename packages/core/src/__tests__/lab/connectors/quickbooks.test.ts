// quickbooks Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/quickbooks';

const config: ConnectorTestConfig = {
  connectorId: 'test-quickbooks',
  connectorType: 'source',
  engine: 'quickbooks',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
