// eventhubs Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/eventhubs';

const config: ConnectorTestConfig = {
  connectorId: 'test-eventhubs',
  connectorType: 'source',
  engine: 'eventhubs',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
