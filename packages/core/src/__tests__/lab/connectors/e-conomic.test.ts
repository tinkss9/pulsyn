// e-conomic Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/e-conomic';

const config: ConnectorTestConfig = {
  connectorId: 'test-e-conomic',
  connectorType: 'source',
  engine: 'e-conomic',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
