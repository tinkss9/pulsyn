// restaurant365 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/restaurant365';

const config: ConnectorTestConfig = {
  connectorId: 'test-restaurant365',
  connectorType: 'source',
  engine: 'restaurant365',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
