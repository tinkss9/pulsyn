// nebulagraph Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nebulagraph';

const config: ConnectorTestConfig = {
  connectorId: 'test-nebulagraph',
  connectorType: 'source',
  engine: 'nebulagraph',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
