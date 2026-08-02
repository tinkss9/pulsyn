// peoplesoft Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/peoplesoft';

const config: ConnectorTestConfig = {
  connectorId: 'test-peoplesoft',
  connectorType: 'source',
  engine: 'peoplesoft',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
