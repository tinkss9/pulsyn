// tripadvisor Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tripadvisor';

const config: ConnectorTestConfig = {
  connectorId: 'test-tripadvisor',
  connectorType: 'source',
  engine: 'tripadvisor',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
