// therapynotes Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/therapynotes';

const config: ConnectorTestConfig = {
  connectorId: 'test-therapynotes',
  connectorType: 'source',
  engine: 'therapynotes',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
